<?php
/**
 * Database Information Collector
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Database_Info {
    
    /**
     * Get all database information
     */
    public function get_info() {
        global $wpdb;
        
        return array(
            'summary' => $this->get_summary(),
            'tables' => $this->get_tables_info(),
            'health' => $this->get_health_info(),
            'optimization' => $this->get_optimization_info(),
        );
    }
    
    /**
     * Get summary
     */
    private function get_summary() {
        global $wpdb;
        
        $total_size = 0;
        $total_rows = 0;
        $table_count = 0;
        
        $tables = $wpdb->get_results("SHOW TABLE STATUS FROM `" . DB_NAME . "`");
        
        if ($tables) {
            foreach ($tables as $table) {
                if (strpos($table->Name, $wpdb->prefix) === 0) {
                    $total_size += ($table->Data_length + $table->Index_length);
                    $total_rows += $table->Rows;
                    $table_count++;
                }
            }
        }
        
        return array(
            'total_tables' => $table_count,
            'total_size' => $this->format_bytes($total_size),
            'total_size_bytes' => $total_size,
            'total_rows' => $total_rows,
        );
    }
    
    /**
     * Get tables info
     */
    private function get_tables_info() {
        global $wpdb;
        
        $tables = $wpdb->get_results("SHOW TABLE STATUS FROM `" . DB_NAME . "`");
        $tables_data = array();
        
        if ($tables) {
            foreach ($tables as $table) {
                // Only include WP tables
                if (strpos($table->Name, $wpdb->prefix) === 0) {
                    $size = $table->Data_length + $table->Index_length;
                    $tables_data[] = array(
                        'name' => $table->Name,
                        'engine' => $table->Engine,
                        'rows' => (int) $table->Rows,
                        'data_size' => $this->format_bytes($table->Data_length),
                        'index_size' => $this->format_bytes($table->Index_length),
                        'total_size' => $this->format_bytes($size),
                        'total_size_bytes' => $size,
                        'collation' => $table->Collation,
                        'auto_increment' => $table->Auto_increment,
                    );
                }
            }
            
            // Sort by size descending
            usort($tables_data, function($a, $b) {
                return $b['total_size_bytes'] - $a['total_size_bytes'];
            });
        }
        
        return $tables_data;
    }
    
    /**
     * Get health info
     */
    private function get_health_info() {
        global $wpdb;
        
        // Count post revisions
        $revisions_count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'revision'"
        );
        
        // Count auto-drafts
        $autodrafts_count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status = 'auto-draft'"
        );
        
        // Count trashed posts
        $trashed_count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status = 'trash'"
        );
        
        // Count spam comments
        $spam_comments = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->comments} WHERE comment_approved = 'spam'"
        );
        
        // Count trashed comments
        $trashed_comments = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->comments} WHERE comment_approved = 'trash'"
        );
        
        // Count transients
        $transients_count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'"
        );
        
        // Expired transients
        $expired_transients = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->options} 
             WHERE option_name LIKE '%_transient_timeout_%' 
             AND option_value < UNIX_TIMESTAMP()"
        );
        
        return array(
            'post_revisions' => (int) $revisions_count,
            'auto_drafts' => (int) $autodrafts_count,
            'trashed_posts' => (int) $trashed_count,
            'spam_comments' => (int) $spam_comments,
            'trashed_comments' => (int) $trashed_comments,
            'total_transients' => (int) $transients_count,
            'expired_transients' => (int) $expired_transients,
        );
    }
    
    /**
     * Get optimization info
     */
    private function get_optimization_info() {
        global $wpdb;
        
        // Autoloaded options
        $autoload_size = $wpdb->get_var(
            "SELECT SUM(LENGTH(option_value)) 
             FROM {$wpdb->options} 
             WHERE autoload = 'yes'"
        );
        
        $autoload_count = $wpdb->get_var(
            "SELECT COUNT(*) 
             FROM {$wpdb->options} 
             WHERE autoload = 'yes'"
        );
        
        // Largest autoloaded options
        $large_autoload = $wpdb->get_results(
            "SELECT option_name, LENGTH(option_value) as size 
             FROM {$wpdb->options} 
             WHERE autoload = 'yes' 
             ORDER BY size DESC 
             LIMIT 10"
        );
        
        $large_options = array();
        foreach ($large_autoload as $option) {
            $large_options[] = array(
                'name' => $option->option_name,
                'size' => $this->format_bytes($option->size),
                'size_bytes' => (int) $option->size,
            );
        }
        
        // Orphaned postmeta
        $orphaned_postmeta = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->postmeta} pm 
             LEFT JOIN {$wpdb->posts} p ON pm.post_id = p.ID 
             WHERE p.ID IS NULL"
        );
        
        // Orphaned usermeta
        $orphaned_usermeta = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->usermeta} um 
             LEFT JOIN {$wpdb->users} u ON um.user_id = u.ID 
             WHERE u.ID IS NULL"
        );
        
        // Orphaned commentmeta
        $orphaned_commentmeta = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->commentmeta} cm 
             LEFT JOIN {$wpdb->comments} c ON cm.comment_id = c.comment_ID 
             WHERE c.comment_ID IS NULL"
        );
        
        return array(
            'autoload_size' => $this->format_bytes($autoload_size),
            'autoload_size_bytes' => (int) $autoload_size,
            'autoload_count' => (int) $autoload_count,
            'autoload_warning' => $autoload_size > 1000000, // Warning if > 1MB
            'largest_autoload_options' => $large_options,
            'orphaned_postmeta' => (int) $orphaned_postmeta,
            'orphaned_usermeta' => (int) $orphaned_usermeta,
            'orphaned_commentmeta' => (int) $orphaned_commentmeta,
        );
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
