<?php
/**
 * Security Information Collector
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Security_Info {
    
    /**
     * Get all security information
     */
    public function get_info() {
        return array(
            'ssl' => $this->get_ssl_info(),
            'users' => $this->get_users_info(),
            'files' => $this->get_files_info(),
            'settings' => $this->get_security_settings(),
            'recommendations' => $this->get_recommendations(),
        );
    }
    
    /**
     * Get SSL information
     */
    private function get_ssl_info() {
        $site_url = get_site_url();
        $is_https = strpos($site_url, 'https://') === 0;
        
        return array(
            'enabled' => $is_https,
            'site_url_secure' => $is_https,
            'force_ssl_admin' => defined('FORCE_SSL_ADMIN') && FORCE_SSL_ADMIN,
            'force_ssl_login' => defined('FORCE_SSL_LOGIN') && FORCE_SSL_LOGIN,
        );
    }
    
    /**
     * Get users information
     */
    private function get_users_info() {
        $admins = get_users(array(
            'role' => 'administrator',
            'fields' => array('ID', 'user_login', 'user_email', 'display_name'),
        ));
        
        $admin_list = array();
        foreach ($admins as $admin) {
            $last_login = get_user_meta($admin->ID, 'last_login', true);
            
            $admin_list[] = array(
                'id' => $admin->ID,
                'username' => $admin->user_login,
                'email' => $admin->user_email,
                'display_name' => $admin->display_name,
                'has_weak_username' => in_array(strtolower($admin->user_login), array('admin', 'administrator', 'root', 'user')),
                'last_login' => $last_login ?: 'Never recorded',
            );
        }
        
        // Check for admin username (security risk)
        $admin_user_exists = username_exists('admin');
        
        // Total user counts by role
        $user_counts = count_users();
        
        return array(
            'total_users' => $user_counts['total_users'],
            'users_by_role' => $user_counts['avail_roles'],
            'administrator_count' => count($admins),
            'administrators' => $admin_list,
            'admin_username_exists' => (bool) $admin_user_exists,
        );
    }
    
    /**
     * Get files information
     */
    private function get_files_info() {
        $results = array(
            'wp_config_writable' => is_writable(ABSPATH . 'wp-config.php'),
            'htaccess_writable' => is_writable(ABSPATH . '.htaccess'),
            'uploads_writable' => is_writable(wp_upload_dir()['basedir']),
            'plugins_writable' => is_writable(WP_PLUGIN_DIR),
            'themes_writable' => is_writable(get_theme_root()),
        );
        
        // Check for debug.log exposure
        $debug_log_path = WP_CONTENT_DIR . '/debug.log';
        $results['debug_log_exists'] = file_exists($debug_log_path);
        
        if ($results['debug_log_exists']) {
            $results['debug_log_size'] = $this->format_bytes(filesize($debug_log_path));
        }
        
        // Check for readme.html (version disclosure)
        $results['readme_exists'] = file_exists(ABSPATH . 'readme.html');
        
        // Check for wp-config-sample.php
        $results['sample_config_exists'] = file_exists(ABSPATH . 'wp-config-sample.php');
        
        // Check for install.php
        $results['install_php_exists'] = file_exists(ABSPATH . 'wp-admin/install.php');
        
        return $results;
    }
    
    /**
     * Get security settings
     */
    private function get_security_settings() {
        return array(
            'disallow_file_edit' => defined('DISALLOW_FILE_EDIT') && DISALLOW_FILE_EDIT,
            'disallow_file_mods' => defined('DISALLOW_FILE_MODS') && DISALLOW_FILE_MODS,
            'wp_debug' => defined('WP_DEBUG') && WP_DEBUG,
            'wp_debug_display' => defined('WP_DEBUG_DISPLAY') && WP_DEBUG_DISPLAY,
            'wp_debug_log' => defined('WP_DEBUG_LOG') && WP_DEBUG_LOG,
            'registration_enabled' => get_option('users_can_register'),
            'default_role' => get_option('default_role'),
            'blog_public' => get_option('blog_public'), // 0 = discourage search engines
            'comment_registration' => get_option('comment_registration'),
            'db_table_prefix_default' => $GLOBALS['wpdb']->prefix === 'wp_',
            'salts_defined' => $this->check_salts_defined(),
        );
    }
    
    /**
     * Check if security salts are defined
     */
    private function check_salts_defined() {
        $salts = array(
            'AUTH_KEY',
            'SECURE_AUTH_KEY',
            'LOGGED_IN_KEY',
            'NONCE_KEY',
            'AUTH_SALT',
            'SECURE_AUTH_SALT',
            'LOGGED_IN_SALT',
            'NONCE_SALT',
        );
        
        foreach ($salts as $salt) {
            if (!defined($salt) || constant($salt) === 'put your unique phrase here') {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get security recommendations
     */
    private function get_recommendations() {
        $recommendations = array();
        
        // Check SSL
        if (strpos(get_site_url(), 'https://') !== 0) {
            $recommendations[] = array(
                'priority' => 'high',
                'issue' => 'SSL not enabled',
                'recommendation' => 'Enable SSL/HTTPS for your website',
            );
        }
        
        // Check debug mode
        if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_DISPLAY') && WP_DEBUG_DISPLAY) {
            $recommendations[] = array(
                'priority' => 'high',
                'issue' => 'Debug display enabled',
                'recommendation' => 'Disable WP_DEBUG_DISPLAY in production',
            );
        }
        
        // Check file edit
        if (!defined('DISALLOW_FILE_EDIT') || !DISALLOW_FILE_EDIT) {
            $recommendations[] = array(
                'priority' => 'medium',
                'issue' => 'File editing enabled',
                'recommendation' => 'Add DISALLOW_FILE_EDIT to wp-config.php',
            );
        }
        
        // Check admin username
        if (username_exists('admin')) {
            $recommendations[] = array(
                'priority' => 'medium',
                'issue' => 'Default admin username exists',
                'recommendation' => 'Change the admin username or delete the user',
            );
        }
        
        // Check table prefix
        if ($GLOBALS['wpdb']->prefix === 'wp_') {
            $recommendations[] = array(
                'priority' => 'low',
                'issue' => 'Default table prefix',
                'recommendation' => 'Consider using a custom table prefix',
            );
        }
        
        // Check user registration
        if (get_option('users_can_register')) {
            $recommendations[] = array(
                'priority' => 'low',
                'issue' => 'User registration enabled',
                'recommendation' => 'Disable if not needed: Settings > General',
            );
        }
        
        return $recommendations;
    }
    
    /**
     * Format bytes to human readable
     */
    private function format_bytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
