<?php
/**
 * REST API Endpoints
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_REST_API {
    
    /**
     * Main plugin instance
     */
    private $plugin;
    
    /**
     * API namespace
     */
    const NAMESPACE = 'jeeves-reporter/v1';
    
    /**
     * Constructor
     */
    public function __construct($plugin) {
        $this->plugin = $plugin;
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Full report endpoint
        register_rest_route(self::NAMESPACE, '/report', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_full_report'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // System info endpoint
        register_rest_route(self::NAMESPACE, '/system', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_system_info'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // Plugins endpoint
        register_rest_route(self::NAMESPACE, '/plugins', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_plugins_info'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // Themes endpoint
        register_rest_route(self::NAMESPACE, '/themes', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_themes_info'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // Database endpoint
        register_rest_route(self::NAMESPACE, '/database', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_database_info'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // Security endpoint
        register_rest_route(self::NAMESPACE, '/security', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_security_info'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // Content endpoint
        register_rest_route(self::NAMESPACE, '/content', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_content_info'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // Performance endpoint
        register_rest_route(self::NAMESPACE, '/performance', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_performance_info'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // Updates log endpoint
        register_rest_route(self::NAMESPACE, '/updates', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_updates_log'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'days' => array(
                    'default' => 30,
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));

        // Monthly updates endpoint (for reports)
        register_rest_route(self::NAMESPACE, '/updates/monthly', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_monthly_updates'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'year' => array(
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ),
                'month' => array(
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
        
        // Health check endpoint (public)
        register_rest_route(self::NAMESPACE, '/health', array(
            'methods' => 'GET',
            'callback' => array($this, 'health_check'),
            'permission_callback' => '__return_true',
        ));
        
        // API info endpoint (public)
        register_rest_route(self::NAMESPACE, '/', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_api_info'),
            'permission_callback' => '__return_true',
        ));
    }
    
    /**
     * Check permission via API key
     */
    public function check_permission($request) {
        return $this->plugin->auth->verify_request($request);
    }
    
    /**
     * Get API info (public)
     */
    public function get_api_info($request) {
        return new WP_REST_Response(array(
            'name' => 'Jeeves Site Reporter API',
            'version' => JEEVES_REPORTER_VERSION,
            'description' => 'REST API for WordPress site maintenance reports',
            'endpoints' => array(
                '/report' => 'Full site report (all data)',
                '/system' => 'System and server information',
                '/plugins' => 'Installed plugins information',
                '/themes' => 'Installed themes information',
                '/database' => 'Database statistics and health',
                '/security' => 'Security audit information',
                '/content' => 'Content statistics',
                '/performance' => 'Performance and caching info',
                '/updates' => 'Recent updates log (last N days)',
                '/updates/monthly' => 'Monthly updates for reports (year, month params)',
                '/health' => 'API health check (public)',
            ),
            'authentication' => 'Required via X-Jeeves-API-Key header or api_key parameter',
            'documentation' => 'https://github.com/assemblestudio/jeeves-site-reporter',
        ), 200);
    }
    
    /**
     * Health check (public)
     */
    public function health_check($request) {
        global $wp_version;
        
        return new WP_REST_Response(array(
            'status' => 'ok',
            'timestamp' => current_time('c'),
            'wordpress_version' => $wp_version,
            'php_version' => phpversion(),
            'plugin_version' => JEEVES_REPORTER_VERSION,
        ), 200);
    }
    
    /**
     * Get full report
     */
    public function get_full_report($request) {
        return new WP_REST_Response($this->plugin->get_full_report(), 200);
    }
    
    /**
     * Get system info
     */
    public function get_system_info($request) {
        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'system' => $this->plugin->system->get_info(),
        ), 200);
    }
    
    /**
     * Get plugins info
     */
    public function get_plugins_info($request) {
        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'plugins' => $this->plugin->plugins->get_info(),
        ), 200);
    }
    
    /**
     * Get themes info
     */
    public function get_themes_info($request) {
        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'themes' => $this->plugin->themes->get_info(),
        ), 200);
    }
    
    /**
     * Get database info
     */
    public function get_database_info($request) {
        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'database' => $this->plugin->database->get_info(),
        ), 200);
    }
    
    /**
     * Get security info
     */
    public function get_security_info($request) {
        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'security' => $this->plugin->security->get_info(),
        ), 200);
    }
    
    /**
     * Get content info
     */
    public function get_content_info($request) {
        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'content' => $this->plugin->content->get_info(),
        ), 200);
    }
    
    /**
     * Get performance info
     */
    public function get_performance_info($request) {
        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'performance' => $this->plugin->performance->get_info(),
        ), 200);
    }
    
    /**
     * Get updates log
     */
    public function get_updates_log($request) {
        $days = $request->get_param('days');

        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'updates' => $this->plugin->updates_logger->get_recent_updates($days),
        ), 200);
    }

    /**
     * Get monthly updates (for reports)
     */
    public function get_monthly_updates($request) {
        $year = $request->get_param('year');
        $month = $request->get_param('month');

        return new WP_REST_Response(array(
            'generated_at' => current_time('c'),
            'year' => $year,
            'month' => $month,
            'updates' => $this->plugin->updates_logger->get_monthly_updates($year, $month),
        ), 200);
    }
}
