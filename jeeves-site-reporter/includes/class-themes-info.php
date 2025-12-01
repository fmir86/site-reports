<?php
/**
 * Themes Information Collector
 */

if (!defined('ABSPATH')) {
    exit;
}

class Jeeves_Themes_Info {
    
    /**
     * Get all themes information
     */
    public function get_info() {
        $all_themes = wp_get_themes();
        $active_theme = wp_get_theme();
        $update_themes = get_site_transient('update_themes');
        
        return array(
            'summary' => $this->get_summary($all_themes, $update_themes),
            'active_theme' => $this->get_active_theme_info($active_theme),
            'parent_theme' => $this->get_parent_theme_info($active_theme),
            'themes' => $this->get_themes_list($all_themes, $active_theme, $update_themes),
        );
    }
    
    /**
     * Get summary
     */
    private function get_summary($all_themes, $update_themes) {
        $updates_count = 0;
        if (is_object($update_themes) && isset($update_themes->response)) {
            $updates_count = count($update_themes->response);
        }
        
        return array(
            'total_themes' => count($all_themes),
            'themes_with_updates' => $updates_count,
            'auto_updates_enabled' => $this->count_auto_updates($all_themes),
        );
    }
    
    /**
     * Get active theme info
     */
    private function get_active_theme_info($active_theme) {
        $update_themes = get_site_transient('update_themes');
        $stylesheet = $active_theme->get_stylesheet();
        $has_update = isset($update_themes->response[$stylesheet]);
        
        return array(
            'name' => $active_theme->get('Name'),
            'slug' => $stylesheet,
            'version' => $active_theme->get('Version'),
            'author' => $active_theme->get('Author'),
            'author_uri' => $active_theme->get('AuthorURI'),
            'theme_uri' => $active_theme->get('ThemeURI'),
            'description' => $active_theme->get('Description'),
            'is_child_theme' => $active_theme->parent() !== false,
            'has_update' => $has_update,
            'new_version' => $has_update ? $update_themes->response[$stylesheet]['new_version'] : null,
            'template' => $active_theme->get('Template'),
            'requires_wp' => $active_theme->get('RequiresWP'),
            'requires_php' => $active_theme->get('RequiresPHP'),
            'tags' => $active_theme->get('Tags'),
            'screenshot' => $active_theme->get_screenshot(),
        );
    }
    
    /**
     * Get parent theme info (if using child theme)
     */
    private function get_parent_theme_info($active_theme) {
        $parent = $active_theme->parent();
        
        if (!$parent) {
            return null;
        }
        
        $update_themes = get_site_transient('update_themes');
        $stylesheet = $parent->get_stylesheet();
        $has_update = isset($update_themes->response[$stylesheet]);
        
        return array(
            'name' => $parent->get('Name'),
            'slug' => $stylesheet,
            'version' => $parent->get('Version'),
            'author' => $parent->get('Author'),
            'has_update' => $has_update,
            'new_version' => $has_update ? $update_themes->response[$stylesheet]['new_version'] : null,
        );
    }
    
    /**
     * Get themes list
     */
    private function get_themes_list($all_themes, $active_theme, $update_themes) {
        $themes_data = array();
        $auto_updates = (array) get_site_option('auto_update_themes', array());
        $active_stylesheet = $active_theme->get_stylesheet();
        $parent_stylesheet = $active_theme->get('Template');
        
        foreach ($all_themes as $theme_slug => $theme) {
            $has_update = isset($update_themes->response[$theme_slug]);
            
            $theme_data = array(
                'name' => $theme->get('Name'),
                'slug' => $theme_slug,
                'version' => $theme->get('Version'),
                'author' => $theme->get('Author'),
                'author_uri' => $theme->get('AuthorURI'),
                'theme_uri' => $theme->get('ThemeURI'),
                'is_active' => ($theme_slug === $active_stylesheet),
                'is_parent_of_active' => ($theme_slug === $parent_stylesheet && $theme_slug !== $active_stylesheet),
                'is_child_theme' => $theme->parent() !== false,
                'auto_update_enabled' => in_array($theme_slug, $auto_updates),
                'has_update' => $has_update,
                'new_version' => $has_update ? $update_themes->response[$theme_slug]['new_version'] : null,
                'requires_wp' => $theme->get('RequiresWP'),
                'requires_php' => $theme->get('RequiresPHP'),
            );
            
            $themes_data[] = $theme_data;
        }
        
        // Sort: active first, then parent, then alphabetically
        usort($themes_data, function($a, $b) {
            if ($a['is_active'] !== $b['is_active']) {
                return $b['is_active'] - $a['is_active'];
            }
            if ($a['is_parent_of_active'] !== $b['is_parent_of_active']) {
                return $b['is_parent_of_active'] - $a['is_parent_of_active'];
            }
            return strcasecmp($a['name'], $b['name']);
        });
        
        return $themes_data;
    }
    
    /**
     * Count themes with auto-update enabled
     */
    private function count_auto_updates($all_themes) {
        $auto_updates = (array) get_site_option('auto_update_themes', array());
        $count = 0;
        
        foreach (array_keys($all_themes) as $theme_slug) {
            if (in_array($theme_slug, $auto_updates)) {
                $count++;
            }
        }
        
        return $count;
    }
}
