<?php
/**
 * Content Information Collector
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Content_Info {
    
    /**
     * Get all content information
     */
    public function get_info() {
        return array(
            'posts' => $this->get_posts_info(),
            'pages' => $this->get_pages_info(),
            'custom_post_types' => $this->get_cpt_info(),
            'media' => $this->get_media_info(),
            'comments' => $this->get_comments_info(),
            'taxonomies' => $this->get_taxonomies_info(),
        );
    }
    
    /**
     * Get posts information
     */
    private function get_posts_info() {
        $counts = wp_count_posts('post');
        
        return array(
            'published' => (int) $counts->publish,
            'draft' => (int) $counts->draft,
            'pending' => (int) $counts->pending,
            'private' => (int) $counts->private,
            'scheduled' => (int) $counts->future,
            'trash' => (int) $counts->trash,
            'total' => array_sum((array) $counts) - (int) $counts->trash,
        );
    }
    
    /**
     * Get pages information
     */
    private function get_pages_info() {
        $counts = wp_count_posts('page');
        
        return array(
            'published' => (int) $counts->publish,
            'draft' => (int) $counts->draft,
            'pending' => (int) $counts->pending,
            'private' => (int) $counts->private,
            'trash' => (int) $counts->trash,
            'total' => array_sum((array) $counts) - (int) $counts->trash,
        );
    }
    
    /**
     * Get custom post types information
     */
    private function get_cpt_info() {
        $post_types = get_post_types(array(
            'public' => true,
            '_builtin' => false,
        ), 'objects');
        
        $cpt_data = array();
        
        foreach ($post_types as $post_type) {
            $counts = wp_count_posts($post_type->name);
            
            $cpt_data[] = array(
                'name' => $post_type->name,
                'label' => $post_type->label,
                'published' => (int) $counts->publish,
                'draft' => (int) $counts->draft,
                'total' => array_sum((array) $counts) - (int) ($counts->trash ?? 0),
            );
        }
        
        return $cpt_data;
    }
    
    /**
     * Get media information
     */
    private function get_media_info() {
        global $wpdb;
        
        $counts = wp_count_attachments();
        $total = array_sum((array) $counts);
        
        // Get upload directory size
        $upload_dir = wp_upload_dir();
        $upload_size = $this->get_directory_size($upload_dir['basedir']);
        
        // Get media by type
        $media_types = array();
        foreach ($counts as $type => $count) {
            if ($count > 0) {
                $media_types[$type] = (int) $count;
            }
        }
        
        // Get recent uploads
        $recent_uploads = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} 
             WHERE post_type = 'attachment' 
             AND post_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );
        
        return array(
            'total' => $total,
            'by_type' => $media_types,
            'uploads_size' => $this->format_bytes($upload_size),
            'uploads_size_bytes' => $upload_size,
            'recent_uploads_30_days' => (int) $recent_uploads,
        );
    }
    
    /**
     * Get comments information
     */
    private function get_comments_info() {
        $counts = wp_count_comments();
        
        return array(
            'approved' => (int) $counts->approved,
            'pending' => (int) $counts->moderated,
            'spam' => (int) $counts->spam,
            'trash' => (int) $counts->trash,
            'total' => (int) $counts->total_comments,
        );
    }
    
    /**
     * Get taxonomies information
     */
    private function get_taxonomies_info() {
        $taxonomies = get_taxonomies(array('public' => true), 'objects');
        $tax_data = array();
        
        foreach ($taxonomies as $taxonomy) {
            $count = wp_count_terms(array(
                'taxonomy' => $taxonomy->name,
                'hide_empty' => false,
            ));
            
            if (!is_wp_error($count)) {
                $tax_data[] = array(
                    'name' => $taxonomy->name,
                    'label' => $taxonomy->label,
                    'count' => (int) $count,
                );
            }
        }
        
        return $tax_data;
    }
    
    /**
     * Get directory size recursively
     */
    private function get_directory_size($path) {
        $size = 0;
        
        if (!is_dir($path)) {
            return 0;
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
            }
        }
        
        return $size;
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
