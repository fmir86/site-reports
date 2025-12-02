<?php
/**
 * Updates Logger - Tracks plugin/theme/core updates with version history
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Updates_Logger {

    const TABLE_NAME = 'jeeves_updates_log';

    /**
     * Store versions before update
     */
    private $pre_update_versions = array();

    /**
     * Constructor
     */
    public function __construct() {
        // Hook BEFORE update to capture old versions
        add_filter('upgrader_pre_install', array($this, 'capture_pre_update_versions'), 10, 2);

        // Hook AFTER update to log with both versions
        add_action('upgrader_process_complete', array($this, 'log_update'), 10, 2);

        // Plugin lifecycle events
        add_action('activated_plugin', array($this, 'log_plugin_activation'), 10, 2);
        add_action('deactivated_plugin', array($this, 'log_plugin_deactivation'), 10, 2);
        add_action('deleted_plugin', array($this, 'log_plugin_deletion'), 10, 2);

        // Track new plugin installations
        add_action('upgrader_process_complete', array($this, 'log_plugin_installation'), 10, 2);

        // Theme events
        add_action('switch_theme', array($this, 'log_theme_switch'), 10, 3);
    }

    /**
     * Create the log table
     */
    public function create_table() {
        global $wpdb;

        $table_name = $wpdb->prefix . self::TABLE_NAME;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            item_type varchar(50) NOT NULL,
            item_name varchar(255) NOT NULL,
            item_slug varchar(255) DEFAULT NULL,
            old_version varchar(50) DEFAULT NULL,
            new_version varchar(50) DEFAULT NULL,
            user_id bigint(20) DEFAULT NULL,
            user_login varchar(60) DEFAULT NULL,
            event_date datetime DEFAULT CURRENT_TIMESTAMP,
            details longtext DEFAULT NULL,
            PRIMARY KEY (id),
            KEY event_type (event_type),
            KEY item_type (item_type),
            KEY event_date (event_date)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    /**
     * Capture versions BEFORE update happens
     */
    public function capture_pre_update_versions($response, $hook_extra) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $type = $hook_extra['type'] ?? '';

        if ($type === 'plugin') {
            // Store current versions of all plugins before update
            $all_plugins = get_plugins();
            foreach ($all_plugins as $plugin_file => $plugin_data) {
                $this->pre_update_versions['plugin'][$plugin_file] = $plugin_data['Version'];
            }
        } elseif ($type === 'theme') {
            // Store current versions of all themes before update
            $themes = wp_get_themes();
            foreach ($themes as $theme_slug => $theme) {
                $this->pre_update_versions['theme'][$theme_slug] = $theme->get('Version');
            }
        } elseif ($type === 'core') {
            global $wp_version;
            $this->pre_update_versions['core']['wordpress'] = $wp_version;
        }

        return $response;
    }

    /**
     * Log an update event
     */
    public function log_update($upgrader, $options) {
        if (!isset($options['action']) || $options['action'] !== 'update') {
            return;
        }

        $type = $options['type'] ?? '';

        switch ($type) {
            case 'plugin':
                $this->log_plugin_update($options);
                break;
            case 'theme':
                $this->log_theme_update($options);
                break;
            case 'core':
                $this->log_core_update();
                break;
        }
    }

    /**
     * Log plugin update with old and new versions
     */
    private function log_plugin_update($options) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $plugins = isset($options['plugins']) ? $options['plugins'] : array();
        if (isset($options['plugin'])) {
            $plugins = array($options['plugin']);
        }

        // Refresh plugin data to get new versions
        wp_cache_delete('plugins', 'plugins');
        $all_plugins = get_plugins();

        foreach ($plugins as $plugin_file) {
            $plugin_data = isset($all_plugins[$plugin_file]) ? $all_plugins[$plugin_file] : null;

            if ($plugin_data) {
                $old_version = isset($this->pre_update_versions['plugin'][$plugin_file])
                    ? $this->pre_update_versions['plugin'][$plugin_file]
                    : null;

                $new_version = $plugin_data['Version'];

                // Only log if version actually changed
                if ($old_version !== $new_version) {
                    $this->insert_log(array(
                        'event_type' => 'update',
                        'item_type' => 'plugin',
                        'item_name' => $plugin_data['Name'],
                        'item_slug' => $plugin_file,
                        'old_version' => $old_version,
                        'new_version' => $new_version,
                    ));
                }
            }
        }
    }

    /**
     * Log theme update with old and new versions
     */
    private function log_theme_update($options) {
        $themes = isset($options['themes']) ? $options['themes'] : array();
        if (isset($options['theme'])) {
            $themes = array($options['theme']);
        }

        foreach ($themes as $theme_slug) {
            $theme = wp_get_theme($theme_slug);

            if ($theme->exists()) {
                $old_version = isset($this->pre_update_versions['theme'][$theme_slug])
                    ? $this->pre_update_versions['theme'][$theme_slug]
                    : null;

                $new_version = $theme->get('Version');

                // Only log if version actually changed
                if ($old_version !== $new_version) {
                    $this->insert_log(array(
                        'event_type' => 'update',
                        'item_type' => 'theme',
                        'item_name' => $theme->get('Name'),
                        'item_slug' => $theme_slug,
                        'old_version' => $old_version,
                        'new_version' => $new_version,
                    ));
                }
            }
        }
    }

    /**
     * Log core update
     */
    private function log_core_update() {
        global $wp_version;

        $old_version = isset($this->pre_update_versions['core']['wordpress'])
            ? $this->pre_update_versions['core']['wordpress']
            : null;

        if ($old_version !== $wp_version) {
            $this->insert_log(array(
                'event_type' => 'update',
                'item_type' => 'core',
                'item_name' => 'WordPress',
                'item_slug' => 'wordpress',
                'old_version' => $old_version,
                'new_version' => $wp_version,
            ));
        }
    }

    /**
     * Log new plugin installation
     */
    public function log_plugin_installation($upgrader, $options) {
        if (!isset($options['action']) || $options['action'] !== 'install') {
            return;
        }

        if (!isset($options['type']) || $options['type'] !== 'plugin') {
            return;
        }

        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        // Get the newly installed plugin info
        $plugin_info = $upgrader->plugin_info ?? null;

        if ($plugin_info) {
            wp_cache_delete('plugins', 'plugins');
            $all_plugins = get_plugins();
            $plugin_data = isset($all_plugins[$plugin_info]) ? $all_plugins[$plugin_info] : null;

            if ($plugin_data) {
                $this->insert_log(array(
                    'event_type' => 'installation',
                    'item_type' => 'plugin',
                    'item_name' => $plugin_data['Name'],
                    'item_slug' => $plugin_info,
                    'old_version' => null,
                    'new_version' => $plugin_data['Version'],
                ));
            }
        }
    }

    /**
     * Log plugin activation
     */
    public function log_plugin_activation($plugin, $network_wide) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $plugin_data = isset($all_plugins[$plugin]) ? $all_plugins[$plugin] : null;

        if ($plugin_data) {
            $this->insert_log(array(
                'event_type' => 'activation',
                'item_type' => 'plugin',
                'item_name' => $plugin_data['Name'],
                'item_slug' => $plugin,
                'new_version' => $plugin_data['Version'],
                'details' => json_encode(array('network_wide' => $network_wide)),
            ));
        }
    }

    /**
     * Log plugin deactivation
     */
    public function log_plugin_deactivation($plugin, $network_wide) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $plugin_data = isset($all_plugins[$plugin]) ? $all_plugins[$plugin] : null;

        if ($plugin_data) {
            $this->insert_log(array(
                'event_type' => 'deactivation',
                'item_type' => 'plugin',
                'item_name' => $plugin_data['Name'],
                'item_slug' => $plugin,
                'new_version' => $plugin_data['Version'],
                'details' => json_encode(array('network_wide' => $network_wide)),
            ));
        }
    }

    /**
     * Log plugin deletion - capture info before deletion
     */
    public function log_plugin_deletion($plugin_file, $deleted) {
        if ($deleted) {
            // Extract plugin name from the file path
            $plugin_name = basename(dirname($plugin_file));
            if ($plugin_name === '.') {
                $plugin_name = basename($plugin_file, '.php');
            }

            $this->insert_log(array(
                'event_type' => 'deletion',
                'item_type' => 'plugin',
                'item_name' => $plugin_name,
                'item_slug' => $plugin_file,
            ));
        }
    }

    /**
     * Log theme switch
     */
    public function log_theme_switch($new_name, $new_theme, $old_theme) {
        $this->insert_log(array(
            'event_type' => 'switch',
            'item_type' => 'theme',
            'item_name' => $new_name,
            'item_slug' => $new_theme->get_stylesheet(),
            'new_version' => $new_theme->get('Version'),
            'old_version' => $old_theme ? $old_theme->get('Version') : null,
            'details' => json_encode(array(
                'old_theme' => $old_theme ? $old_theme->get('Name') : null,
            )),
        ));
    }

    /**
     * Insert log entry
     */
    private function insert_log($data) {
        global $wpdb;

        $user = wp_get_current_user();

        $defaults = array(
            'event_type' => '',
            'item_type' => '',
            'item_name' => '',
            'item_slug' => null,
            'old_version' => null,
            'new_version' => null,
            'user_id' => $user->ID ?: null,
            'user_login' => $user->user_login ?: 'system',
            'event_date' => current_time('mysql'),
            'details' => null,
        );

        $data = wp_parse_args($data, $defaults);

        $table_name = $wpdb->prefix . self::TABLE_NAME;

        $wpdb->insert($table_name, $data);
    }

    /**
     * Get recent updates - formatted for reports
     */
    public function get_recent_updates($days = 30) {
        global $wpdb;

        $table_name = $wpdb->prefix . self::TABLE_NAME;

        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
            return array(
                'error' => 'Log table not created yet. Please deactivate and reactivate the plugin.',
                'updates' => array(),
                'installations' => array(),
                'deletions' => array(),
            );
        }

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name
             WHERE event_date >= DATE_SUB(NOW(), INTERVAL %d DAY)
             ORDER BY event_date DESC",
            $days
        ), ARRAY_A);

        // Organize by event type
        $updates = array();
        $installations = array();
        $deletions = array();
        $activations = array();
        $deactivations = array();

        foreach ($results as $row) {
            // Parse details JSON
            if (!empty($row['details'])) {
                $row['details'] = json_decode($row['details'], true);
            }

            switch ($row['event_type']) {
                case 'update':
                    $updates[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'type' => $row['item_type'],
                        'from' => $row['old_version'],
                        'to' => $row['new_version'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;

                case 'installation':
                    $installations[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'type' => $row['item_type'],
                        'version' => $row['new_version'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;

                case 'deletion':
                    $deletions[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'type' => $row['item_type'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;

                case 'activation':
                    $activations[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'version' => $row['new_version'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;

                case 'deactivation':
                    $deactivations[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'version' => $row['new_version'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;
            }
        }

        // Summary
        $summary = array(
            'period_days' => $days,
            'total_updates' => count($updates),
            'total_installations' => count($installations),
            'total_deletions' => count($deletions),
            'total_activations' => count($activations),
            'total_deactivations' => count($deactivations),
        );

        return array(
            'summary' => $summary,
            'updates' => $updates,
            'installations' => $installations,
            'deletions' => $deletions,
            'activations' => $activations,
            'deactivations' => $deactivations,
            'raw_events' => $results,
        );
    }

    /**
     * Get updates for a specific month (for monthly reports)
     */
    public function get_monthly_updates($year, $month) {
        global $wpdb;

        $table_name = $wpdb->prefix . self::TABLE_NAME;

        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
            return array(
                'error' => 'Log table not created yet',
                'updates' => array(),
            );
        }

        $start_date = sprintf('%04d-%02d-01 00:00:00', $year, $month);
        $end_date = date('Y-m-t 23:59:59', strtotime($start_date));

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name
             WHERE event_date >= %s AND event_date <= %s
             ORDER BY event_date DESC",
            $start_date,
            $end_date
        ), ARRAY_A);

        // Use same organization logic
        return $this->organize_events($results, $year, $month);
    }

    /**
     * Organize events into categories
     */
    private function organize_events($results, $year = null, $month = null) {
        $updates = array();
        $installations = array();
        $deletions = array();

        foreach ($results as $row) {
            if (!empty($row['details'])) {
                $row['details'] = json_decode($row['details'], true);
            }

            switch ($row['event_type']) {
                case 'update':
                    $updates[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'type' => $row['item_type'],
                        'from' => $row['old_version'],
                        'to' => $row['new_version'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;

                case 'installation':
                    $installations[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'type' => $row['item_type'],
                        'version' => $row['new_version'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;

                case 'deletion':
                    $deletions[] = array(
                        'name' => $row['item_name'],
                        'slug' => $row['item_slug'],
                        'type' => $row['item_type'],
                        'date' => $row['event_date'],
                        'user' => $row['user_login'],
                    );
                    break;
            }
        }

        return array(
            'period' => $year && $month ? sprintf('%04d-%02d', $year, $month) : null,
            'summary' => array(
                'total_updates' => count($updates),
                'total_installations' => count($installations),
                'total_deletions' => count($deletions),
            ),
            'updates' => $updates,
            'installations' => $installations,
            'deletions' => $deletions,
        );
    }

    /**
     * Clear old logs
     */
    public function clear_old_logs($days = 365) {
        global $wpdb;

        $table_name = $wpdb->prefix . self::TABLE_NAME;

        return $wpdb->query($wpdb->prepare(
            "DELETE FROM $table_name WHERE event_date < DATE_SUB(NOW(), INTERVAL %d DAY)",
            $days
        ));
    }
}
