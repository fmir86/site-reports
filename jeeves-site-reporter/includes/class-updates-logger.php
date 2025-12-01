<?php
/**
 * Updates Logger - Tracks plugin/theme/core updates
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Updates_Logger {
    
    const TABLE_NAME = 'jeeves_updates_log';
    
    /**
     * Constructor
     */
    public function __construct() {
        // Hook into update events
        add_action('upgrader_process_complete', array($this, 'log_update'), 10, 2);
        add_action('activated_plugin', array($this, 'log_plugin_activation'), 10, 2);
        add_action('deactivated_plugin', array($this, 'log_plugin_deactivation'), 10, 2);
        add_action('switch_theme', array($this, 'log_theme_switch'), 10, 3);
        add_action('deleted_plugin', array($this, 'log_plugin_deletion'), 10, 2);
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
     * Log plugin update
     */
    private function log_plugin_update($options) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $plugins = isset($options['plugins']) ? $options['plugins'] : array();
        if (isset($options['plugin'])) {
            $plugins = array($options['plugin']);
        }
        
        foreach ($plugins as $plugin_file) {
            $all_plugins = get_plugins();
            $plugin_data = isset($all_plugins[$plugin_file]) ? $all_plugins[$plugin_file] : null;
            
            if ($plugin_data) {
                $this->insert_log(array(
                    'event_type' => 'update',
                    'item_type' => 'plugin',
                    'item_name' => $plugin_data['Name'],
                    'item_slug' => $plugin_file,
                    'new_version' => $plugin_data['Version'],
                ));
            }
        }
    }
    
    /**
     * Log theme update
     */
    private function log_theme_update($options) {
        $themes = isset($options['themes']) ? $options['themes'] : array();
        if (isset($options['theme'])) {
            $themes = array($options['theme']);
        }
        
        foreach ($themes as $theme_slug) {
            $theme = wp_get_theme($theme_slug);
            
            if ($theme->exists()) {
                $this->insert_log(array(
                    'event_type' => 'update',
                    'item_type' => 'theme',
                    'item_name' => $theme->get('Name'),
                    'item_slug' => $theme_slug,
                    'new_version' => $theme->get('Version'),
                ));
            }
        }
    }
    
    /**
     * Log core update
     */
    private function log_core_update() {
        global $wp_version;
        
        $this->insert_log(array(
            'event_type' => 'update',
            'item_type' => 'core',
            'item_name' => 'WordPress',
            'item_slug' => 'wordpress',
            'new_version' => $wp_version,
        ));
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
     * Log plugin deletion
     */
    public function log_plugin_deletion($plugin_file, $deleted) {
        if ($deleted) {
            $this->insert_log(array(
                'event_type' => 'deletion',
                'item_type' => 'plugin',
                'item_name' => $plugin_file,
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
     * Get recent updates
     */
    public function get_recent_updates($days = 30) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        
        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
            return array(
                'error' => 'Log table not created yet',
                'updates' => array(),
            );
        }
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name 
             WHERE event_date >= DATE_SUB(NOW(), INTERVAL %d DAY) 
             ORDER BY event_date DESC",
            $days
        ), ARRAY_A);
        
        // Parse details JSON
        foreach ($results as &$row) {
            if (!empty($row['details'])) {
                $row['details'] = json_decode($row['details'], true);
            }
        }
        
        // Summary
        $summary = array(
            'total_events' => count($results),
            'by_type' => array(),
            'by_event' => array(),
        );
        
        foreach ($results as $row) {
            $item_type = $row['item_type'];
            $event_type = $row['event_type'];
            
            if (!isset($summary['by_type'][$item_type])) {
                $summary['by_type'][$item_type] = 0;
            }
            $summary['by_type'][$item_type]++;
            
            if (!isset($summary['by_event'][$event_type])) {
                $summary['by_event'][$event_type] = 0;
            }
            $summary['by_event'][$event_type]++;
        }
        
        return array(
            'period_days' => $days,
            'summary' => $summary,
            'updates' => $results,
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
