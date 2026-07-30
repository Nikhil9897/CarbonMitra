-- Enable Row Level Security (RLS) on all public tables to secure against unauthorized PostgREST API access in Supabase.
-- Note: Spring Boot backend connecting via JDBC as superuser/table-owner will bypass RLS and operate normally.

ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flyway_schema_history ENABLE ROW LEVEL SECURITY;
