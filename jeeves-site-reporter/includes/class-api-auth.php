<?php
/**
 * API Authentication Handler
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_API_Auth {
    
    const API_KEY_OPTION = 'jeeves_reporter_api_key';
    const API_KEY_CREATED_OPTION = 'jeeves_reporter_api_key_created';
    
    /**
     * Get the API key
     */
    public function get_api_key() {
        return get_option(self::API_KEY_OPTION, '');
    }
    
    /**
     * Generate API key if not exists
     */
    public function maybe_generate_api_key() {
        if (empty($this->get_api_key())) {
            $this->regenerate_api_key();
        }
    }
    
    /**
     * Regenerate API key
     */
    public function regenerate_api_key() {
        $new_key = $this->generate_secure_key();
        update_option(self::API_KEY_OPTION, $new_key);
        update_option(self::API_KEY_CREATED_OPTION, current_time('mysql'));
        return $new_key;
    }
    
    /**
     * Generate a secure random key
     */
    private function generate_secure_key() {
        if (function_exists('wp_generate_password')) {
            return 'jsr_' . wp_generate_password(32, false, false);
        }
        return 'jsr_' . bin2hex(random_bytes(16));
    }
    
    /**
     * Verify API key from request
     */
    public function verify_request($request) {
        $provided_key = $request->get_header('X-Jeeves-API-Key');
        
        if (empty($provided_key)) {
            $provided_key = $request->get_header('X-API-Key');
        }
        
        if (empty($provided_key)) {
            $provided_key = $request->get_param('api_key');
        }
        
        $stored_key = $this->get_api_key();
        
        if (empty($stored_key)) {
            return new WP_Error(
                'jeeves_no_api_key',
                __('API key not configured. Please visit the plugin settings.', 'jeeves-site-reporter'),
                array('status' => 500)
            );
        }
        
        if (empty($provided_key)) {
            return new WP_Error(
                'jeeves_missing_api_key',
                __('Missing API key. Provide via X-Jeeves-API-Key header or api_key parameter.', 'jeeves-site-reporter'),
                array('status' => 401)
            );
        }
        
        if (!hash_equals($stored_key, $provided_key)) {
            return new WP_Error(
                'jeeves_invalid_api_key',
                __('Invalid API key.', 'jeeves-site-reporter'),
                array('status' => 403)
            );
        }
        
        return true;
    }
    
    /**
     * Get API key creation date
     */
    public function get_api_key_created_date() {
        return get_option(self::API_KEY_CREATED_OPTION, '');
    }
}
