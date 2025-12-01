<?php
/**
 * Performance Information Collector
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Performance_Info {
    
    /**
     * Get all performance information
     */
    public function get_info() {
        return array(
            'caching' => $this->get_caching_info(),
            'cron' => $this->get_cron_info(),
            'site_health' => $this->get_site_health_info(),
            'resources' => $this->get_resources_info(),
        );
    }
    
    /**
     * Get caching information
     */
    private function get_caching_info() {
        global $wp_object_cache;
        
        // Object cache detection
        $object_cache_type = 'None';
        $has_object_cache = file_exists(WP_CONTENT_DIR . '/object-cache.php');
        
        if ($has_object_cache) {
            // Try to detect cache type
            if (class_exists('Redis')) {
                $object_cache_type = 'Redis';
            } elseif (class_exists('Memcached')) {
                $object_cache_type = 'Memcached';
            } elseif (class_exists('Memcache')) {
                $object_cache_type = 'Memcache';
            } elseif (function_exists('apcu_fetch')) {
                $object_cache_type = 'APCu';
            } else {
                $object_cache_type = 'Custom (Unknown)';
            }
        }
        
        // Page cache detection
        $page_cache_detected = false;
        $page_cache_plugins = array(
            'wp-super-cache/wp-cache.php',
            'w3-total-cache/w3-total-cache.php',
            'wp-fastest-cache/wpFastestCache.php',
            'litespeed-cache/litespeed-cache.php',
            'autoptimize/autoptimize.php',
            'wp-rocket/wp-rocket.php',
            'cache-enabler/cache-enabler.php',
        );
        
        $active_plugins = get_option('active_plugins', array());
        foreach ($page_cache_plugins as $plugin) {
            if (in_array($plugin, $active_plugins)) {
                $page_cache_detected = true;
                break;
            }
        }
        
        // Advanced cache detection
        $advanced_cache = file_exists(WP_CONTENT_DIR . '/advanced-cache.php');
        $wp_cache_constant = defined('WP_CACHE') && WP_CACHE;
        
        return array(
            'object_cache' => array(
                'enabled' => $has_object_cache,
                'type' => $object_cache_type,
                'dropin_exists' => $has_object_cache,
            ),
            'page_cache' => array(
                'plugin_detected' => $page_cache_detected,
                'advanced_cache_exists' => $advanced_cache,
                'wp_cache_constant' => $wp_cache_constant,
            ),
            'opcache' => array(
                'enabled' => function_exists('opcache_get_status') && @opcache_get_status() !== false,
                'status' => $this->get_opcache_status(),
            ),
        );
    }
    
    /**
     * Get OPcache status
     */
    private function get_opcache_status() {
        if (!function_exists('opcache_get_status')) {
            return null;
        }
        
        $status = @opcache_get_status(false);
        
        if (!$status) {
            return null;
        }
        
        return array(
            'enabled' => $status['opcache_enabled'] ?? false,
            'memory_usage_percent' => isset($status['memory_usage']) 
                ? round(($status['memory_usage']['used_memory'] / ($status['memory_usage']['used_memory'] + $status['memory_usage']['free_memory'])) * 100, 2)
                : null,
            'hit_rate' => isset($status['opcache_statistics']['opcache_hit_rate']) 
                ? round($status['opcache_statistics']['opcache_hit_rate'], 2) 
                : null,
            'cached_scripts' => $status['opcache_statistics']['num_cached_scripts'] ?? null,
        );
    }
    
    /**
     * Get cron information
     */
    private function get_cron_info() {
        $cron = _get_cron_array();
        $schedules = wp_get_schedules();
        
        $cron_events = array();
        $next_events = array();
        
        if (!empty($cron)) {
            foreach ($cron as $timestamp => $cronhooks) {
                foreach ($cronhooks as $hook => $events) {
                    foreach ($events as $event) {
                        $schedule = isset($event['schedule']) ? $event['schedule'] : 'single';
                        
                        $cron_events[] = array(
                            'hook' => $hook,
                            'next_run' => date('Y-m-d H:i:s', $timestamp),
                            'next_run_timestamp' => $timestamp,
                            'schedule' => $schedule,
                            'interval' => isset($event['interval']) ? $event['interval'] : null,
                        );
                    }
                }
            }
            
            // Sort by timestamp
            usort($cron_events, function($a, $b) {
                return $a['next_run_timestamp'] - $b['next_run_timestamp'];
            });
            
            // Get next 10 events
            $next_events = array_slice($cron_events, 0, 10);
        }
        
        // Check if WP-Cron is working
        $cron_disabled = defined('DISABLE_WP_CRON') && DISABLE_WP_CRON;
        $alternate_cron = defined('ALTERNATE_WP_CRON') && ALTERNATE_WP_CRON;
        
        // Check for overdue cron events
        $overdue_count = 0;
        $now = time();
        foreach ($cron_events as $event) {
            if ($event['next_run_timestamp'] < $now - 300) { // 5 minutes overdue
                $overdue_count++;
            }
        }
        
        return array(
            'wp_cron_disabled' => $cron_disabled,
            'alternate_cron' => $alternate_cron,
            'total_events' => count($cron_events),
            'overdue_events' => $overdue_count,
            'available_schedules' => array_keys($schedules),
            'next_events' => $next_events,
        );
    }
    
    /**
     * Get Site Health information
     */
    private function get_site_health_info() {
        if (!class_exists('WP_Site_Health')) {
            require_once ABSPATH . 'wp-admin/includes/class-wp-site-health.php';
        }
        
        $health = WP_Site_Health::get_instance();
        $tests = WP_Site_Health::get_tests();
        
        // Run direct tests
        $results = array();
        
        if (isset($tests['direct'])) {
            foreach ($tests['direct'] as $test_name => $test) {
                if (is_callable($test['test'])) {
                    try {
                        $result = call_user_func($test['test']);
                        if (is_array($result)) {
                            $results[$test_name] = array(
                                'label' => $result['label'] ?? '',
                                'status' => $result['status'] ?? 'unknown',
                                'description' => wp_strip_all_tags($result['description'] ?? ''),
                            );
                        }
                    } catch (Exception $e) {
                        $results[$test_name] = array(
                            'label' => $test_name,
                            'status' => 'error',
                            'description' => 'Test failed to run',
                        );
                    }
                }
            }
        }
        
        // Count by status
        $counts = array(
            'good' => 0,
            'recommended' => 0,
            'critical' => 0,
        );
        
        foreach ($results as $result) {
            if (isset($counts[$result['status']])) {
                $counts[$result['status']]++;
            }
        }
        
        return array(
            'summary' => $counts,
            'tests' => $results,
        );
    }
    
    /**
     * Get resources information
     */
    private function get_resources_info() {
        global $wpdb;
        
        // Current memory usage
        $memory_usage = memory_get_usage(true);
        $memory_peak = memory_get_peak_usage(true);
        $memory_limit = $this->convert_to_bytes(ini_get('memory_limit'));
        
        // Query count (if available)
        $query_count = $wpdb->num_queries ?? null;
        
        return array(
            'memory_usage' => $this->format_bytes($memory_usage),
            'memory_peak' => $this->format_bytes($memory_peak),
            'memory_limit' => $this->format_bytes($memory_limit),
            'memory_usage_percent' => round(($memory_usage / $memory_limit) * 100, 2),
            'db_queries' => $query_count,
        );
    }
    
    /**
     * Convert PHP ini value to bytes
     */
    private function convert_to_bytes($value) {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $value = (int) $value;
        
        switch ($last) {
            case 'g':
                $value *= 1024;
            case 'm':
                $value *= 1024;
            case 'k':
                $value *= 1024;
        }
        
        return $value;
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
