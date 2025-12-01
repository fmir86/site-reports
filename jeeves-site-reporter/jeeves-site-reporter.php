<?php
/**
 * Plugin Name: Jeeves Site Reporter
 * Plugin URI: https://fabianmiranda.com
 * Description: Exposes comprehensive site system information via a secure REST API for monthly maintenance reports.
 * Version: 1.0.0
 * Author: Fabian Miranda
 * Author URI: https://fabianmiranda.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: jeeves-site-reporter
 * Requires at least: 5.6
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('JEEVES_REPORTER_VERSION', '1.0.0');
define('JEEVES_REPORTER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('JEEVES_REPORTER_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-api-auth.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-system-info.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-plugins-info.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-themes-info.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-database-info.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-security-info.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-content-info.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-performance-info.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-updates-logger.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once JEEVES_REPORTER_PLUGIN_DIR . 'includes/class-admin-page.php';

/**
 * Main plugin class
 */
class Jeeves_Site_Reporter {
    
    /**
     * Single instance of the class
     */
    private static $instance = null;
    
    /**
     * Plugin components
     */
    public $auth;
    public $system;
    public $plugins;
    public $themes;
    public $database;
    public $security;
    public $content;
    public $performance;
    public $updates_logger;
    public $rest_api;
    public $admin;
    
    /**
     * Get single instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_components();
        $this->init_hooks();
    }
    
    /**
     * Initialize components
     */
    private function init_components() {
        $this->auth = new Jeeves_API_Auth();
        $this->system = new Jeeves_System_Info();
        $this->plugins = new Jeeves_Plugins_Info();
        $this->themes = new Jeeves_Themes_Info();
        $this->database = new Jeeves_Database_Info();
        $this->security = new Jeeves_Security_Info();
        $this->content = new Jeeves_Content_Info();
        $this->performance = new Jeeves_Performance_Info();
        $this->updates_logger = new Jeeves_Updates_Logger();
        $this->rest_api = new Jeeves_REST_API($this);
        $this->admin = new Jeeves_Admin_Page($this->auth);
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        add_action('init', array($this, 'load_textdomain'));
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Generate API key if not exists
        $this->auth->maybe_generate_api_key();
        
        // Create updates log table
        $this->updates_logger->create_table();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    /**
     * Load text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'jeeves-site-reporter',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }
    
    /**
     * Get full report data
     */
    public function get_full_report() {
        return array(
            'report_generated_at' => current_time('c'),
            'report_version' => JEEVES_REPORTER_VERSION,
            'system' => $this->system->get_info(),
            'plugins' => $this->plugins->get_info(),
            'themes' => $this->themes->get_info(),
            'database' => $this->database->get_info(),
            'security' => $this->security->get_info(),
            'content' => $this->content->get_info(),
            'performance' => $this->performance->get_info(),
            'recent_updates' => $this->updates_logger->get_recent_updates(30),
        );
    }
}

/**
 * Initialize the plugin
 */
function jeeves_site_reporter() {
    return Jeeves_Site_Reporter::get_instance();
}

// Start the plugin
jeeves_site_reporter();
