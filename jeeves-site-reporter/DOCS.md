# Jeeves Site Reporter - API Documentation

Plugin de WordPress que expone información del sitio via REST API para reportes de mantenimiento.

## Configuración

### Base URL
```
https://{site-domain}/wp-json/jeeves-reporter/v1
```

### Autenticación

Todas las rutas (excepto `/health`) requieren API key. Se puede enviar de dos formas:

**Header (recomendado):**
```bash
curl -H "X-Jeeves-API-Key: {API_KEY}" https://example.com/wp-json/jeeves-reporter/v1/report
```

**Query parameter:**
```bash
curl "https://example.com/wp-json/jeeves-reporter/v1/report?api_key={API_KEY}"
```

### Obtener el API Key

1. WordPress Admin → Tools → Site Reporter
2. Copiar el API key mostrado
3. Se puede regenerar en cualquier momento (invalida el anterior)

---

## Endpoints

| Endpoint | Auth | Descripción |
|----------|------|-------------|
| `GET /health` | No | Health check público |
| `GET /report` | Sí | **Reporte completo** (todo en uno) |
| `GET /system` | Sí | Info de PHP, MySQL, Server, WordPress |
| `GET /plugins` | Sí | Lista de plugins y updates |
| `GET /themes` | Sí | Lista de themes y updates |
| `GET /database` | Sí | Estadísticas y salud de la DB |
| `GET /security` | Sí | Auditoría de seguridad |
| `GET /content` | Sí | Estadísticas de contenido |
| `GET /performance` | Sí | Cache, cron, Site Health |
| `GET /updates?days=30` | Sí | Log de actualizaciones |

---

## Respuestas por Endpoint

### GET /health (público)

```json
{
  "status": "ok",
  "timestamp": "2024-11-30T15:30:00-06:00",
  "wordpress_version": "6.4.1",
  "php_version": "8.1.23",
  "plugin_version": "1.0.0"
}
```

---

### GET /report

Retorna **todos los datos** en una sola respuesta. Estructura:

```json
{
  "report_generated_at": "2024-11-30T15:30:00-06:00",
  "report_version": "1.0.0",
  "system": { ... },
  "plugins": { ... },
  "themes": { ... },
  "database": { ... },
  "security": { ... },
  "content": { ... },
  "performance": { ... },
  "recent_updates": { ... }
}
```

---

### GET /system

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "system": {
    "site": {
      "name": "Site Name",
      "description": "Site tagline",
      "url": "https://example.com",
      "home_url": "https://example.com",
      "admin_email": "admin@example.com",
      "language": "en_US",
      "timezone": "America/Chicago",
      "is_multisite": false,
      "is_ssl": true,
      "permalink_structure": "/%postname%/"
    },
    "wordpress": {
      "version": "6.4.1",
      "update_available": false,
      "latest_version": "6.4.1",
      "debug_mode": false,
      "debug_log": false,
      "debug_display": false,
      "memory_limit": "256M",
      "max_memory_limit": "512M",
      "wp_cron_disabled": true,
      "uploads_dir": "/path/to/wp-content/uploads"
    },
    "server": {
      "software": "nginx/1.25.3",
      "os": "Linux",
      "architecture": "x86_64",
      "hostname": "server-name"
    },
    "php": {
      "version": "8.1.23",
      "memory_limit": "512M",
      "max_execution_time": "300",
      "max_input_vars": "5000",
      "post_max_size": "64M",
      "upload_max_filesize": "64M",
      "opcache_enabled": true,
      "curl_version": "7.88.1",
      "gd_version": "2.3.3",
      "extensions": {
        "curl": true,
        "mbstring": true,
        "imagick": true,
        "zip": true
      }
    },
    "database": {
      "version": "8.0.35",
      "server_info": "8.0.35-27",
      "is_mariadb": false,
      "database_name": "wp_database",
      "table_prefix": "wp_",
      "charset": "utf8mb4"
    },
    "hosting": {
      "provider": "WP Engine",
      "detected_features": ["WP Engine platform", "API Key configured"]
    }
  }
}
```

---

### GET /plugins

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "plugins": {
    "summary": {
      "total_plugins": 15,
      "active_plugins": 12,
      "inactive_plugins": 3,
      "mu_plugins": 2,
      "plugins_with_updates": 2,
      "auto_updates_enabled": 5
    },
    "plugins": [
      {
        "name": "Advanced Custom Fields PRO",
        "slug": "advanced-custom-fields-pro",
        "file": "advanced-custom-fields-pro/acf.php",
        "version": "6.2.4",
        "author": "Delicious Brains",
        "is_active": true,
        "auto_update_enabled": false,
        "requires_wp": "5.8",
        "requires_php": "7.4",
        "update": null
      },
      {
        "name": "Yoast SEO",
        "slug": "wordpress-seo",
        "file": "wordpress-seo/wp-seo.php",
        "version": "21.5",
        "author": "Team Yoast",
        "is_active": true,
        "auto_update_enabled": true,
        "update": {
          "new_version": "21.6",
          "package": "Available",
          "tested": "6.4.1",
          "requires_php": "7.2.5"
        }
      }
    ],
    "mu_plugins": [
      {
        "name": "WP Engine System",
        "file": "mu-plugin.php",
        "version": "5.0.0"
      }
    ],
    "dropins": [
      {
        "name": "Advanced Cache",
        "file": "advanced-cache.php"
      },
      {
        "name": "Object Cache",
        "file": "object-cache.php"
      }
    ]
  }
}
```

---

### GET /themes

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "themes": {
    "summary": {
      "total_themes": 3,
      "themes_with_updates": 0,
      "auto_updates_enabled": 0
    },
    "active_theme": {
      "name": "Theme Name",
      "slug": "theme-slug",
      "version": "1.0.0",
      "author": "Theme Author",
      "is_child_theme": true,
      "has_update": false,
      "requires_wp": "6.0",
      "requires_php": "8.0"
    },
    "parent_theme": {
      "name": "Parent Theme",
      "slug": "parent-theme",
      "version": "2.5.0",
      "has_update": false
    },
    "themes": [
      {
        "name": "Theme Name",
        "slug": "theme-slug",
        "version": "1.0.0",
        "is_active": true,
        "is_child_theme": true,
        "has_update": false
      }
    ]
  }
}
```

---

### GET /database

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "database": {
    "summary": {
      "total_tables": 45,
      "total_size": "125.5 MB",
      "total_size_bytes": 131596288,
      "total_rows": 50000
    },
    "tables": [
      {
        "name": "wp_posts",
        "engine": "InnoDB",
        "rows": 1500,
        "data_size": "45.2 MB",
        "index_size": "5.1 MB",
        "total_size": "50.3 MB",
        "total_size_bytes": 52742144
      },
      {
        "name": "wp_postmeta",
        "engine": "InnoDB",
        "rows": 25000,
        "total_size": "35.8 MB"
      }
    ],
    "health": {
      "post_revisions": 500,
      "auto_drafts": 5,
      "trashed_posts": 10,
      "spam_comments": 150,
      "trashed_comments": 25,
      "total_transients": 200,
      "expired_transients": 50
    },
    "optimization": {
      "autoload_size": "1.2 MB",
      "autoload_size_bytes": 1258291,
      "autoload_count": 350,
      "autoload_warning": true,
      "largest_autoload_options": [
        {
          "name": "rewrite_rules",
          "size": "150 KB",
          "size_bytes": 153600
        },
        {
          "name": "theme_mods_theme-name",
          "size": "85 KB",
          "size_bytes": 87040
        }
      ],
      "orphaned_postmeta": 100,
      "orphaned_usermeta": 0,
      "orphaned_commentmeta": 25
    }
  }
}
```

---

### GET /security

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "security": {
    "ssl": {
      "enabled": true,
      "site_url_secure": true,
      "force_ssl_admin": true
    },
    "users": {
      "total_users": 5,
      "users_by_role": {
        "administrator": 2,
        "editor": 1,
        "author": 2
      },
      "administrator_count": 2,
      "administrators": [
        {
          "id": 1,
          "username": "admin_user",
          "email": "admin@example.com",
          "display_name": "Admin User",
          "has_weak_username": false,
          "last_login": "2024-11-30 10:00:00"
        }
      ],
      "admin_username_exists": false
    },
    "files": {
      "wp_config_writable": false,
      "htaccess_writable": false,
      "uploads_writable": true,
      "debug_log_exists": false,
      "readme_exists": false,
      "sample_config_exists": false
    },
    "settings": {
      "disallow_file_edit": true,
      "disallow_file_mods": false,
      "wp_debug": false,
      "wp_debug_display": false,
      "registration_enabled": false,
      "default_role": "subscriber",
      "blog_public": 1,
      "db_table_prefix_default": false,
      "salts_defined": true
    },
    "recommendations": [
      {
        "priority": "medium",
        "issue": "File editing enabled",
        "recommendation": "Add DISALLOW_FILE_EDIT to wp-config.php"
      }
    ]
  }
}
```

---

### GET /content

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "content": {
    "posts": {
      "published": 50,
      "draft": 5,
      "pending": 2,
      "private": 1,
      "scheduled": 3,
      "trash": 10,
      "total": 61
    },
    "pages": {
      "published": 15,
      "draft": 2,
      "trash": 1,
      "total": 17
    },
    "custom_post_types": [
      {
        "name": "product",
        "label": "Products",
        "published": 100,
        "draft": 10,
        "total": 110
      },
      {
        "name": "testimonial",
        "label": "Testimonials",
        "published": 20,
        "total": 20
      }
    ],
    "media": {
      "total": 500,
      "by_type": {
        "image/jpeg": 300,
        "image/png": 150,
        "application/pdf": 30,
        "image/webp": 20
      },
      "uploads_size": "1.5 GB",
      "uploads_size_bytes": 1610612736,
      "recent_uploads_30_days": 25
    },
    "comments": {
      "approved": 100,
      "pending": 5,
      "spam": 150,
      "trash": 25,
      "total": 280
    },
    "taxonomies": [
      {
        "name": "category",
        "label": "Categories",
        "count": 15
      },
      {
        "name": "post_tag",
        "label": "Tags",
        "count": 50
      }
    ]
  }
}
```

---

### GET /performance

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "performance": {
    "caching": {
      "object_cache": {
        "enabled": true,
        "type": "Redis",
        "dropin_exists": true
      },
      "page_cache": {
        "plugin_detected": true,
        "advanced_cache_exists": true,
        "wp_cache_constant": true
      },
      "opcache": {
        "enabled": true,
        "status": {
          "enabled": true,
          "memory_usage_percent": 45.5,
          "hit_rate": 99.2,
          "cached_scripts": 1500
        }
      }
    },
    "cron": {
      "wp_cron_disabled": true,
      "alternate_cron": false,
      "total_events": 25,
      "overdue_events": 0,
      "available_schedules": ["hourly", "twicedaily", "daily", "weekly"],
      "next_events": [
        {
          "hook": "wp_scheduled_delete",
          "next_run": "2024-11-30 18:00:00",
          "schedule": "daily"
        },
        {
          "hook": "wp_update_plugins",
          "next_run": "2024-11-30 20:00:00",
          "schedule": "twicedaily"
        }
      ]
    },
    "site_health": {
      "summary": {
        "good": 15,
        "recommended": 3,
        "critical": 0
      },
      "tests": {
        "https_status": {
          "label": "Your website is using an active HTTPS connection",
          "status": "good"
        },
        "php_version": {
          "label": "Your site is running the current version of PHP (8.1.23)",
          "status": "good"
        }
      }
    },
    "resources": {
      "memory_usage": "45 MB",
      "memory_peak": "52 MB",
      "memory_limit": "512 MB",
      "memory_usage_percent": 8.79,
      "db_queries": 35
    }
  }
}
```

---

### GET /updates?days=30

Parámetros opcionales:
- `days` (default: 30) - Número de días hacia atrás

```json
{
  "generated_at": "2024-11-30T15:30:00-06:00",
  "updates": {
    "period_days": 30,
    "summary": {
      "total_events": 10,
      "by_type": {
        "plugin": 8,
        "theme": 1,
        "core": 1
      },
      "by_event": {
        "update": 8,
        "activation": 1,
        "deactivation": 1
      }
    },
    "updates": [
      {
        "id": 1,
        "event_type": "update",
        "item_type": "plugin",
        "item_name": "Yoast SEO",
        "item_slug": "wordpress-seo/wp-seo.php",
        "old_version": "21.4",
        "new_version": "21.5",
        "user_id": 1,
        "user_login": "admin",
        "event_date": "2024-11-28 14:30:00",
        "details": null
      },
      {
        "id": 2,
        "event_type": "update",
        "item_type": "core",
        "item_name": "WordPress",
        "item_slug": "wordpress",
        "old_version": null,
        "new_version": "6.4.1",
        "user_login": "admin",
        "event_date": "2024-11-25 10:00:00"
      }
    ]
  }
}
```

---

## Ejemplos de Código

### JavaScript (fetch)

```javascript
const API_URL = 'https://example.com/wp-json/jeeves-reporter/v1';
const API_KEY = 'jsr_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

async function getFullReport() {
  const response = await fetch(`${API_URL}/report`, {
    headers: {
      'X-Jeeves-API-Key': API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Uso
const report = await getFullReport();
console.log(report.system.php.version);
console.log(report.plugins.summary.plugins_with_updates);
```

### Node.js (axios)

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://example.com/wp-json/jeeves-reporter/v1',
  headers: {
    'X-Jeeves-API-Key': 'jsr_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  }
});

// Full report
const { data: report } = await client.get('/report');

// Solo plugins
const { data: plugins } = await client.get('/plugins');

// Updates de los últimos 60 días
const { data: updates } = await client.get('/updates', {
  params: { days: 60 }
});
```

### Python

```python
import requests

API_URL = 'https://example.com/wp-json/jeeves-reporter/v1'
API_KEY = 'jsr_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

headers = {
    'X-Jeeves-API-Key': API_KEY
}

# Full report
response = requests.get(f'{API_URL}/report', headers=headers)
report = response.json()

print(f"PHP Version: {report['system']['php']['version']}")
print(f"Plugins with updates: {report['plugins']['summary']['plugins_with_updates']}")

# Solo database info
response = requests.get(f'{API_URL}/database', headers=headers)
database = response.json()
print(f"Database size: {database['database']['summary']['total_size']}")
```

### cURL

```bash
# Health check (público)
curl https://example.com/wp-json/jeeves-reporter/v1/health

# Full report
curl -H "X-Jeeves-API-Key: jsr_xxx" \
  https://example.com/wp-json/jeeves-reporter/v1/report

# Solo plugins
curl -H "X-Jeeves-API-Key: jsr_xxx" \
  https://example.com/wp-json/jeeves-reporter/v1/plugins

# Updates últimos 60 días
curl -H "X-Jeeves-API-Key: jsr_xxx" \
  "https://example.com/wp-json/jeeves-reporter/v1/updates?days=60"

# Guardar a archivo JSON
curl -H "X-Jeeves-API-Key: jsr_xxx" \
  https://example.com/wp-json/jeeves-reporter/v1/report \
  -o report.json
```

---

## Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | Missing API key | No se envió el API key |
| 403 | Invalid API key | API key incorrecto |
| 500 | API key not configured | Plugin no tiene API key generado |

Ejemplo de respuesta de error:

```json
{
  "code": "jeeves_invalid_api_key",
  "message": "Invalid API key.",
  "data": {
    "status": 403
  }
}
```

---

## Notas Importantes

1. **Updates Log**: El log de actualizaciones solo registra eventos DESPUÉS de instalar el plugin. No tiene datos históricos previos.

2. **Site Health Tests**: Algunos tests pueden tardar varios segundos en ejecutarse. El endpoint `/report` puede ser lento en la primera llamada.

3. **Caché**: Las respuestas no están cacheadas por defecto. Para sitios con mucho tráfico, considera cachear las respuestas en tu aplicación.

4. **Tamaño de respuesta**: El endpoint `/report` puede retornar varios KB de JSON. Usa los endpoints individuales si solo necesitas datos específicos.

5. **Permisos de archivos**: Algunos datos de seguridad (como permisos de archivos) pueden variar según la configuración del servidor.

---

## Sitios Configurados

| Sitio | Base URL | Notas |
|-------|----------|-------|
| SaDr Amelis Spine | `https://sadramelispine.com/wp-json/jeeves-reporter/v1` | WP Engine |

---

## Changelog

### 1.0.0
- Initial release
- System, plugins, themes, database, security, content, performance endpoints
- Updates logger
- API key authentication
