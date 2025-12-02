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
        
        return array(
            'summary' => $this->get_summary($all_plugins, $active_plugins, $update_plugins, $mu_plugins),
            'plugins' => $this->get_plugins_list($all_plugins, $active_plugins, $update_plugins),
            'mu_plugins' => $this->get_mu_plugins_list($mu_plugins),
            'dropins' => $this->get_dropins_list($dropins),
        );
    }
    
    /**
     * Get summary
     */
    private function get_summary($all_plugins, $active_plugins, $update_plugins, $mu_plugins) {
        $updates_count = 0;
        $blocked_updates_count = 0;

        if (is_object($update_plugins) && isset($update_plugins->response)) {
            foreach ($update_plugins->response as $plugin_path => $update_info) {
                $updates_count++;
                // Count blocked updates (no package available = license issue)
                if (!isset($update_info->package) || empty($update_info->package)) {
                    $blocked_updates_count++;
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
            
            $plugin_data = array(
                'name' => $plugin_info['Name'],
                'slug' => dirname($plugin_path),
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
}
