<?php
/**
 * Plugins Information Collector
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Plugins_Info {
    
    /**
     * Get all plugins information
     */
    public function get_info() {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        $update_plugins = get_site_transient('update_plugins');
        
        // Must-use plugins
        $mu_plugins = get_mu_plugins();
        
        // Drop-ins
        $dropins = get_dropins();
        
        $plugins_list = $this->get_plugins_list($all_plugins, $active_plugins, $update_plugins);

        return array(
            'summary' => $this->get_summary($all_plugins, $active_plugins, $update_plugins, $mu_plugins, $plugins_list),
            'plugins' => $plugins_list,
            'mu_plugins' => $this->get_mu_plugins_list($mu_plugins),
            'dropins' => $this->get_dropins_list($dropins),
        );
    }
    
    /**
     * Get summary
     */
    private function get_summary($all_plugins, $active_plugins, $update_plugins, $mu_plugins, $plugins_list) {
        $updates_count = 0;
        $blocked_updates_count = 0;

        if (is_object($update_plugins) && isset($update_plugins->response)) {
            foreach ($update_plugins->response as $plugin_path => $update_info) {
                $updates_count++;
                // Count blocked updates (no package available)
                if (!isset($update_info->package) || empty($update_info->package)) {
                    $blocked_updates_count++;
                }
            }
        }

        // Count plugins with license issues
        $license_issues_count = 0;
        foreach ($plugins_list as $plugin) {
            if (!empty($plugin['license']) && isset($plugin['license']['status'])) {
                $status = $plugin['license']['status'];
                // Count any status that's not 'valid', 'active', 'entered', or 'connected'
                if (!in_array($status, array('valid', 'active', 'entered', 'connected'))) {
                    $license_issues_count++;
                }
            }
        }

        return array(
            'total_plugins' => count($all_plugins),
            'active_plugins' => count($active_plugins),
            'inactive_plugins' => count($all_plugins) - count($active_plugins),
            'mu_plugins' => count($mu_plugins),
            'plugins_with_updates' => $updates_count,
            'blocked_updates' => $blocked_updates_count,
            'license_issues' => $license_issues_count,
            'auto_updates_enabled' => $this->count_auto_updates($all_plugins),
        );
    }
    
    /**
     * Get plugins list
     */
    private function get_plugins_list($all_plugins, $active_plugins, $update_plugins) {
        $plugins_data = array();
        $auto_updates = (array) get_site_option('auto_update_plugins', array());
        
        foreach ($all_plugins as $plugin_path => $plugin_info) {
            $is_active = in_array($plugin_path, $active_plugins);
            $has_update = isset($update_plugins->response[$plugin_path]);
            $update_info = $has_update ? $update_plugins->response[$plugin_path] : null;
            
            $plugin_slug = dirname($plugin_path);

            $plugin_data = array(
                'name' => $plugin_info['Name'],
                'slug' => $plugin_slug,
                'file' => $plugin_path,
                'version' => $plugin_info['Version'],
                'author' => wp_strip_all_tags($plugin_info['Author']),
                'author_uri' => $plugin_info['AuthorURI'],
                'plugin_uri' => $plugin_info['PluginURI'],
                'description' => wp_strip_all_tags($plugin_info['Description']),
                'is_active' => $is_active,
                'is_network_active' => is_multisite() && is_plugin_active_for_network($plugin_path),
                'auto_update_enabled' => in_array($plugin_path, $auto_updates),
                'requires_wp' => isset($plugin_info['RequiresWP']) ? $plugin_info['RequiresWP'] : null,
                'requires_php' => isset($plugin_info['RequiresPHP']) ? $plugin_info['RequiresPHP'] : null,
                'update' => null,
                'license' => $this->check_plugin_license($plugin_slug),
            );
            
            // Add update info if available
            if ($has_update && $update_info) {
                $package_available = isset($update_info->package) && !empty($update_info->package);

                $plugin_data['update'] = array(
                    'new_version' => $update_info->new_version ?? null,
                    'package' => $package_available ? 'Available' : 'Not available',
                    'url' => $update_info->url ?? null,
                    'tested' => $update_info->tested ?? null,
                    'requires_php' => $update_info->requires_php ?? null,
                    'update_blocked' => !$package_available,
                    // Don't assume reason - package may be unavailable for various reasons:
                    // license expired, manual update required, third-party plugin, network issues, etc.
                    'blocked_reason' => !$package_available ? 'Package not available' : null,
                );
            }
            
            $plugins_data[] = $plugin_data;
        }
        
        // Sort: active first, then alphabetically
        usort($plugins_data, function($a, $b) {
            if ($a['is_active'] !== $b['is_active']) {
                return $b['is_active'] - $a['is_active'];
            }
            return strcasecmp($a['name'], $b['name']);
        });
        
        return $plugins_data;
    }
    
    /**
     * Get must-use plugins list
     */
    private function get_mu_plugins_list($mu_plugins) {
        $plugins_data = array();
        
        foreach ($mu_plugins as $plugin_path => $plugin_info) {
            $plugins_data[] = array(
                'name' => $plugin_info['Name'],
                'file' => $plugin_path,
                'version' => $plugin_info['Version'],
                'author' => wp_strip_all_tags($plugin_info['Author']),
                'description' => wp_strip_all_tags($plugin_info['Description']),
            );
        }
        
        return $plugins_data;
    }
    
    /**
     * Get drop-ins list
     */
    private function get_dropins_list($dropins) {
        $available_dropins = _get_dropins();
        $plugins_data = array();
        
        foreach ($dropins as $plugin_path => $plugin_info) {
            $plugins_data[] = array(
                'name' => $plugin_info['Name'],
                'file' => $plugin_path,
                'version' => $plugin_info['Version'],
                'description' => isset($available_dropins[$plugin_path]) 
                    ? $available_dropins[$plugin_path][0] 
                    : wp_strip_all_tags($plugin_info['Description']),
            );
        }
        
        return $plugins_data;
    }
    
    /**
     * Count plugins with auto-update enabled
     */
    private function count_auto_updates($all_plugins) {
        $auto_updates = (array) get_site_option('auto_update_plugins', array());
        $count = 0;

        foreach (array_keys($all_plugins) as $plugin_path) {
            if (in_array($plugin_path, $auto_updates)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Check license status for known premium plugins
     * Returns license info if plugin has known license options
     */
    private function check_plugin_license($plugin_slug) {
        $license_info = null;

        // Known premium plugins and their license option patterns
        $premium_plugins = array(
            // Elementor Pro
            'elementor-pro' => array(
                'check' => function() {
                    $license_key = get_option('elementor_pro_license_key', '');
                    $license_data = get_option('elementor_pro_license_data', array());

                    if (empty($license_key)) {
                        return array(
                            'status' => 'missing',
                            'message' => 'No license key entered',
                        );
                    }

                    // Check license data for issues
                    if (!empty($license_data)) {
                        if (is_object($license_data)) {
                            $license_data = (array) $license_data;
                        }

                        // Check for license mismatch or expiration
                        if (isset($license_data['license']) && $license_data['license'] !== 'valid') {
                            $status = $license_data['license'];
                            $message = 'License issue';

                            if ($status === 'expired') {
                                $message = 'License expired';
                            } elseif ($status === 'disabled') {
                                $message = 'License disabled';
                            } elseif ($status === 'invalid') {
                                $message = 'Invalid license key';
                            } elseif ($status === 'site_inactive' || $status === 'inactive') {
                                $message = 'License not activated for this site';
                            } elseif (isset($license_data['error'])) {
                                if ($license_data['error'] === 'missing') {
                                    $message = 'License key missing';
                                } elseif ($license_data['error'] === 'no_activations_left') {
                                    $message = 'No activations left';
                                } elseif ($license_data['error'] === 'expired') {
                                    $message = 'License expired';
                                } else {
                                    $message = 'License error: ' . $license_data['error'];
                                }
                            }

                            return array(
                                'status' => $status,
                                'message' => $message,
                            );
                        }

                        // License is valid
                        if (isset($license_data['license']) && $license_data['license'] === 'valid') {
                            return array(
                                'status' => 'valid',
                                'message' => 'License active',
                                'expires' => isset($license_data['expires']) ? $license_data['expires'] : null,
                            );
                        }
                    }

                    return array(
                        'status' => 'unknown',
                        'message' => 'License status unknown',
                    );
                },
            ),

            // ACF Pro
            'advanced-custom-fields-pro' => array(
                'check' => function() {
                    $license_key = get_option('acf_pro_license', '');

                    if (empty($license_key)) {
                        return array(
                            'status' => 'missing',
                            'message' => 'No license key entered',
                        );
                    }

                    // ACF stores encoded license
                    $license_status = get_option('acf_pro_license_status', array());
                    if (!empty($license_status) && isset($license_status['status'])) {
                        return array(
                            'status' => $license_status['status'],
                            'message' => $license_status['status'] === 'active' ? 'License active' : 'License ' . $license_status['status'],
                        );
                    }

                    return array(
                        'status' => 'entered',
                        'message' => 'License key entered',
                    );
                },
            ),

            // Gravity Forms
            'gravityforms' => array(
                'check' => function() {
                    $license_key = get_option('rg_gforms_key', '');

                    if (empty($license_key)) {
                        return array(
                            'status' => 'missing',
                            'message' => 'No license key entered',
                        );
                    }

                    return array(
                        'status' => 'entered',
                        'message' => 'License key entered',
                    );
                },
            ),

            // WPForms Pro
            'wpforms' => array(
                'check' => function() {
                    $license = get_option('wpforms_license', array());

                    if (empty($license) || empty($license['key'])) {
                        return array(
                            'status' => 'missing',
                            'message' => 'No license key entered',
                        );
                    }

                    if (isset($license['type'])) {
                        return array(
                            'status' => 'valid',
                            'message' => 'License active (' . ucfirst($license['type']) . ')',
                        );
                    }

                    return array(
                        'status' => 'entered',
                        'message' => 'License key entered',
                    );
                },
            ),

            // Yoast SEO Premium
            'wordpress-seo-premium' => array(
                'check' => function() {
                    $licenses = get_option('yoast_licenses', array());

                    if (empty($licenses)) {
                        return array(
                            'status' => 'missing',
                            'message' => 'No license activated',
                        );
                    }

                    return array(
                        'status' => 'entered',
                        'message' => 'License configured',
                    );
                },
            ),

            // WooCommerce subscriptions and extensions often use this pattern
            'woocommerce-subscriptions' => array(
                'check' => function() {
                    // WooCommerce.com connected
                    $auth = get_option('woocommerce_helper_data', array());

                    if (empty($auth) || empty($auth['access_token'])) {
                        return array(
                            'status' => 'disconnected',
                            'message' => 'WooCommerce.com not connected',
                        );
                    }

                    return array(
                        'status' => 'connected',
                        'message' => 'WooCommerce.com connected',
                    );
                },
            ),
        );

        // Check if this plugin has a known license check
        if (isset($premium_plugins[$plugin_slug])) {
            $license_info = $premium_plugins[$plugin_slug]['check']();
        }

        return $license_info;
    }
}
