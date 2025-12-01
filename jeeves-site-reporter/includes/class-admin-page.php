<?php
/**
 * Admin Page
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Admin_Page {
    
    /**
     * Auth instance
     */
    private $auth;
    
    /**
     * Constructor
     */
    public function __construct($auth) {
        $this->auth = $auth;
        
        add_action('admin_menu', array($this, 'add_menu'));
        add_action('admin_init', array($this, 'handle_actions'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_styles'));
    }
    
    /**
     * Add admin menu
     */
    public function add_menu() {
        add_management_page(
            __('Jeeves Site Reporter', 'jeeves-site-reporter'),
            __('Site Reporter', 'jeeves-site-reporter'),
            'manage_options',
            'jeeves-site-reporter',
            array($this, 'render_page')
        );
    }
    
    /**
     * Enqueue styles
     */
    public function enqueue_styles($hook) {
        if ($hook !== 'tools_page_jeeves-site-reporter') {
            return;
        }
        
        wp_add_inline_style('wp-admin', '
            .jeeves-wrap { max-width: 800px; }
            .jeeves-card { background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; padding: 20px; margin-bottom: 20px; }
            .jeeves-card h2 { margin-top: 0; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .jeeves-api-key { font-family: monospace; background: #f0f0f1; padding: 10px 15px; border-radius: 4px; font-size: 14px; word-break: break-all; }
            .jeeves-endpoints { margin: 0; }
            .jeeves-endpoints li { padding: 8px 0; border-bottom: 1px solid #f0f0f1; }
            .jeeves-endpoints li:last-child { border-bottom: none; }
            .jeeves-endpoints code { background: #f0f0f1; padding: 2px 6px; border-radius: 3px; }
            .jeeves-example { background: #23282d; color: #fff; padding: 15px; border-radius: 4px; overflow-x: auto; }
            .jeeves-example code { color: #7ec699; }
            .jeeves-warning { background: #fcf9e8; border-left: 4px solid #dba617; padding: 12px; margin: 15px 0; }
            .jeeves-success { background: #edfaef; border-left: 4px solid #46b450; padding: 12px; margin: 15px 0; }
        ');
    }
    
    /**
     * Handle admin actions
     */
    public function handle_actions() {
        if (!isset($_POST['jeeves_action'])) {
            return;
        }
        
        if (!wp_verify_nonce($_POST['jeeves_nonce'], 'jeeves_admin_action')) {
            return;
        }
        
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $action = sanitize_text_field($_POST['jeeves_action']);
        
        switch ($action) {
            case 'regenerate_key':
                $this->auth->regenerate_api_key();
                add_settings_error(
                    'jeeves_messages',
                    'jeeves_key_regenerated',
                    __('API key regenerated successfully.', 'jeeves-site-reporter'),
                    'success'
                );
                break;
        }
    }
    
    /**
     * Render admin page
     */
    public function render_page() {
        $api_key = $this->auth->get_api_key();
        $api_key_created = $this->auth->get_api_key_created_date();
        $site_url = get_site_url();
        
        ?>
        <div class="wrap jeeves-wrap">
            <h1><?php _e('Jeeves Site Reporter', 'jeeves-site-reporter'); ?></h1>
            
            <?php settings_errors('jeeves_messages'); ?>
            
            <div class="jeeves-card">
                <h2><?php _e('API Key', 'jeeves-site-reporter'); ?></h2>
                
                <p><?php _e('Use this API key to authenticate requests to the REST API endpoints.', 'jeeves-site-reporter'); ?></p>
                
                <div class="jeeves-api-key" id="api-key">
                    <?php echo esc_html($api_key); ?>
                </div>
                
                <p style="margin-top: 10px;">
                    <button type="button" class="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($api_key); ?>'); this.textContent='Copied!';">
                        <?php _e('Copy to Clipboard', 'jeeves-site-reporter'); ?>
                    </button>
                </p>
                
                <?php if ($api_key_created): ?>
                <p class="description">
                    <?php printf(__('Key created: %s', 'jeeves-site-reporter'), esc_html($api_key_created)); ?>
                </p>
                <?php endif; ?>
                
                <div class="jeeves-warning">
                    <strong><?php _e('Warning:', 'jeeves-site-reporter'); ?></strong>
                    <?php _e('Regenerating the API key will invalidate the current key. Any integrations using the old key will stop working.', 'jeeves-site-reporter'); ?>
                </div>
                
                <form method="post" style="margin-top: 15px;">
                    <?php wp_nonce_field('jeeves_admin_action', 'jeeves_nonce'); ?>
                    <input type="hidden" name="jeeves_action" value="regenerate_key">
                    <button type="submit" class="button button-secondary" onclick="return confirm('<?php esc_attr_e('Are you sure you want to regenerate the API key?', 'jeeves-site-reporter'); ?>');">
                        <?php _e('Regenerate API Key', 'jeeves-site-reporter'); ?>
                    </button>
                </form>
            </div>
            
            <div class="jeeves-card">
                <h2><?php _e('API Endpoints', 'jeeves-site-reporter'); ?></h2>
                
                <p><?php _e('The following endpoints are available:', 'jeeves-site-reporter'); ?></p>
                
                <ul class="jeeves-endpoints">
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/report</code><br>
                        <span class="description"><?php _e('Full site report with all data', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/system</code><br>
                        <span class="description"><?php _e('System and server information', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/plugins</code><br>
                        <span class="description"><?php _e('Installed plugins information', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/themes</code><br>
                        <span class="description"><?php _e('Installed themes information', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/database</code><br>
                        <span class="description"><?php _e('Database statistics and health', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/security</code><br>
                        <span class="description"><?php _e('Security audit information', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/content</code><br>
                        <span class="description"><?php _e('Content statistics', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/performance</code><br>
                        <span class="description"><?php _e('Performance and caching information', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/updates</code><br>
                        <span class="description"><?php _e('Recent updates log (add ?days=30 for custom period)', 'jeeves-site-reporter'); ?></span>
                    </li>
                    <li>
                        <code>GET /wp-json/jeeves-reporter/v1/health</code><br>
                        <span class="description"><?php _e('API health check (public, no auth required)', 'jeeves-site-reporter'); ?></span>
                    </li>
                </ul>
            </div>
            
            <div class="jeeves-card">
                <h2><?php _e('Usage Example', 'jeeves-site-reporter'); ?></h2>
                
                <p><?php _e('Using cURL:', 'jeeves-site-reporter'); ?></p>
                
                <div class="jeeves-example">
                    <code>curl -H "X-Jeeves-API-Key: <?php echo esc_html($api_key); ?>" \<br>
                    &nbsp;&nbsp;<?php echo esc_url($site_url); ?>/wp-json/jeeves-reporter/v1/report</code>
                </div>
                
                <p style="margin-top: 20px;"><?php _e('Using query parameter:', 'jeeves-site-reporter'); ?></p>
                
                <div class="jeeves-example">
                    <code><?php echo esc_url($site_url); ?>/wp-json/jeeves-reporter/v1/report?api_key=<?php echo esc_html($api_key); ?></code>
                </div>
                
                <p style="margin-top: 20px;"><?php _e('Test the health endpoint (public):', 'jeeves-site-reporter'); ?></p>
                
                <p>
                    <a href="<?php echo esc_url($site_url); ?>/wp-json/jeeves-reporter/v1/health" target="_blank" class="button">
                        <?php _e('Open Health Endpoint', 'jeeves-site-reporter'); ?>
                    </a>
                </p>
            </div>
            
            <div class="jeeves-card">
                <h2><?php _e('Quick Test', 'jeeves-site-reporter'); ?></h2>
                
                <p><?php _e('Click below to test the full report endpoint:', 'jeeves-site-reporter'); ?></p>
                
                <p>
                    <a href="<?php echo esc_url($site_url . '/wp-json/jeeves-reporter/v1/report?api_key=' . $api_key); ?>" target="_blank" class="button button-primary">
                        <?php _e('View Full Report (JSON)', 'jeeves-site-reporter'); ?>
                    </a>
                </p>
            </div>
        </div>
        <?php
    }
}
