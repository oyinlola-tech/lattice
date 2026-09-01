---
"@oyinlola141/lattice-database": patch
---
Security: override mysql2 transitive dependency to ^3.22.0 to fix credential disclosure vulnerability (mysql_clear_password auth switch without TLS).
