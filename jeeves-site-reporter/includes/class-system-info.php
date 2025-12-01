<?php
/**
 * System Information Collector
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_System_Info {
    
    /**
     * Get all system information
     */
    public function get_info() {
        global $wpdb;
        
        return array(
            'site' => $this->get_site_info(),
            'wordpress' => $this->get_wordpress_info(),
            'server' => $this->get_server_info(),
            'php' => $this->get_php_info(),
            'database' => $this->get_database_info(),
            'hosting' => $this->get_hosting_info(),
        );
    }
    
    /**
     * Get site information
     */
    private function get_site_info() {
        return array(
            'name' => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
            'url' => get_site_url(),
            'home_url' => get_home_url(),
            'admin_email' => get_option('admin_email'),
            'language' => get_locale(),
            'timezone' => $this->get_timezone(),
            'date_format' => get_option('date_format'),
            'time_format' => get_option('time_format'),
            'is_multisite' => is_multisite(),
            'is_ssl' => is_ssl(),
            'permalink_structure' => get_option('permalink_structure') ?: 'Plain',
        );
    }
    
    /**
     * Get WordPress information
     */
    private function get_wordpress_info() {
        global $wp_version;
        
        $updates = get_site_transient('update_core');
        $update_available = false;
        $latest_version = $wp_version;
        
        if (isset($updates->updates) && !empty($updates->updates)) {
            $latest = $updates->updates[0];
            if (isset($latest->version) && version_compare($wp_version, $latest->version, '<')) {
                $update_available = true;
                $latest_version = $latest->version;
            }
        }
        
        return array(
            'version' => $wp_version,
            'update_available' => $update_available,
            'latest_version' => $latest_version,
            'debug_mode' => defined('WP_DEBUG') && WP_DEBUG,
            'debug_log' => defined('WP_DEBUG_LOG') && WP_DEBUG_LOG,
            'debug_display' => defined('WP_DEBUG_DISPLAY') && WP_DEBUG_DISPLAY,
            'script_debug' => defined('SCRIPT_DEBUG') && SCRIPT_DEBUG,
            'memory_limit' => WP_MEMORY_LIMIT,
            'max_memory_limit' => defined('WP_MAX_MEMORY_LIMIT') ? WP_MAX_MEMORY_LIMIT : 'Not defined',
            'abspath' => ABSPATH,
            'content_dir' => WP_CONTENT_DIR,
            'plugin_dir' => WP_PLUGIN_DIR,
            'uploads_dir' => wp_upload_dir()['basedir'],
            'wp_cron_disabled' => defined('DISABLE_WP_CRON') && DISABLE_WP_CRON,
            'concatenate_scripts' => defined('CONCATENATE_SCRIPTS') ? CONCATENATE_SCRIPTS : 'Not defined',
            'savequeries' => defined('SAVEQUERIES') && SAVEQUERIES,
        );
    }
    
    /**
     * Get server information
     */
    private function get_server_info() {
        return array(
            'software' => isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : 'Unknown',
            'server_protocol' => isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'Unknown',
            'server_name' => isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'Unknown',
            'document_root' => isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : 'Unknown',
            'os' => PHP_OS,
            'os_family' => PHP_OS_FAMILY ?? 'Unknown',
            'architecture' => php_uname('m'),
            'hostname' => php_uname('n'),
        );
    }
    
    /**
     * Get PHP information
     */
    private function get_php_info() {
        return array(
            'version' => phpversion(),
            'sapi' => php_sapi_name(),
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'max_input_time' => ini_get('max_input_time'),
            'max_input_vars' => ini_get('max_input_vars'),
            'post_max_size' => ini_get('post_max_size'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'max_file_uploads' => ini_get('max_file_uploads'),
            'display_errors' => ini_get('display_errors'),
            'error_reporting' => $this->get_error_reporting_string(),
            'extensions' => $this->get_important_extensions(),
            'opcache_enabled' => function_exists('opcache_get_status') && @opcache_get_status() !== false,
            'curl_version' => function_exists('curl_version') ? curl_version()['version'] : 'Not available',
            'imagick_version' => extension_loaded('imagick') ? phpversion('imagick') : 'Not available',
            'gd_version' => function_exists('gd_info') ? gd_info()['GD Version'] : 'Not available',
            'openssl_version' => defined('OPENSSL_VERSION_TEXT') ? OPENSSL_VERSION_TEXT : 'Not available',
            'zlib_enabled' => extension_loaded('zlib'),
            'mbstring_enabled' => extension_loaded('mbstring'),
            'intl_enabled' => extension_loaded('intl'),
        );
    }
    
    /**
     * Get database information
     */
    private function get_database_info() {
        global $wpdb;
        
        $mysql_version = $wpdb->db_version();
        
        // Check if using MariaDB
        $server_info = $wpdb->get_var("SELECT VERSION()");
        $is_mariadb = stripos($server_info, 'mariadb') !== false;
        
        return array(
            'version' => $mysql_version,
            'server_info' => $server_info,
            'is_mariadb' => $is_mariadb,
            'database_name' => DB_NAME,
            'host' => DB_HOST,
            'table_prefix' => $wpdb->prefix,
            'charset' => DB_CHARSET,
            'collate' => DB_COLLATE ?: 'Default',
            'client_info' => $wpdb->get_var("SELECT @@version_comment") ?: 'Unknown',
        );
    }
    
    /**
     * Get hosting information
     */
    private function get_hosting_info() {
        $hosting = array(
            'provider' => 'Unknown',
            'detected_features' => array(),
        );
        
        // WP Engine detection
        if (defined('WPE_APIKEY') || (isset($_SERVER['IS_WPE']) && $_SERVER['IS_WPE'])) {
            $hosting['provider'] = 'WP Engine';
            $hosting['detected_features'][] = 'WP Engine platform';
            
            if (defined('WPE_APIKEY')) {
                $hosting['detected_features'][] = 'API Key configured';
            }
        }
        
        // Cloudways detection
        if (isset($_SERVER['cw_allowed_ip'])) {
            $hosting['provider'] = 'Cloudways';
        }
        
        // Kinsta detection
        if (defined('KINSTAMU_VERSION')) {
            $hosting['provider'] = 'Kinsta';
        }
        
        // Flywheel detection
        if (defined('FLYWHEEL_CONFIG_DIR')) {
            $hosting['provider'] = 'Flywheel';
        }
        
        // Pantheon detection
        if (isset($_ENV['PANTHEON_ENVIRONMENT'])) {
            $hosting['provider'] = 'Pantheon';
            $hosting['environment'] = $_ENV['PANTHEON_ENVIRONMENT'];
        }
        
        // SiteGround detection
        if (isset($_SERVER['HTTP_CDN_LOOP']) && strpos($_SERVER['HTTP_CDN_LOOP'], 'siteground') !== false) {
            $hosting['provider'] = 'SiteGround';
        }
        
        return $hosting;
    }
    
    /**
     * Get timezone
     */
    private function get_timezone() {
        $timezone_string = get_option('timezone_string');
        
        if (!empty($timezone_string)) {
            return $timezone_string;
        }
        
        $offset = get_option('gmt_offset', 0);
        $hours = (int) $offset;
        $minutes = abs(($offset - $hours) * 60);
        
        return sprintf('UTC%+d:%02d', $hours, $minutes);
    }
    
    /**
     * Get error reporting level as string
     */
    private function get_error_reporting_string() {
        $level = error_reporting();
        $levels = array();
        
        $constants = array(
            E_ERROR => 'E_ERROR',
            E_WARNING => 'E_WARNING',
            E_PARSE => 'E_PARSE',
            E_NOTICE => 'E_NOTICE',
            E_CORE_ERROR => 'E_CORE_ERROR',
            E_CORE_WARNING => 'E_CORE_WARNING',
            E_COMPILE_ERROR => 'E_COMPILE_ERROR',
            E_COMPILE_WARNING => 'E_COMPILE_WARNING',
            E_USER_ERROR => 'E_USER_ERROR',
            E_USER_WARNING => 'E_USER_WARNING',
            E_USER_NOTICE => 'E_USER_NOTICE',
            E_STRICT => 'E_STRICT',
            E_RECOVERABLE_ERROR => 'E_RECOVERABLE_ERROR',
            E_DEPRECATED => 'E_DEPRECATED',
            E_USER_DEPRECATED => 'E_USER_DEPRECATED',
        );
        
        foreach ($constants as $value => $name) {
            if ($level & $value) {
                $levels[] = $name;
            }
        }
        
        return $level . ' (' . implode(' | ', $levels) . ')';
    }
    
    /**
     * Get important PHP extensions status
     */
    private function get_important_extensions() {
        $extensions = array(
            'curl', 'dom', 'exif', 'fileinfo', 'hash', 'json', 
            'mbstring', 'mysqli', 'openssl', 'pcre', 'imagick', 
            'gd', 'zip', 'filter', 'iconv', 'intl', 'sodium'
        );
        
        $result = array();
        foreach ($extensions as $ext) {
            $result[$ext] = extension_loaded($ext);
        }
        
        return $result;
    }
}
