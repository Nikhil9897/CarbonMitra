-- Enable Row Level Security (RLS) on all public tables to secure against unauthorized PostgREST API access in Supabase.
-- Note: Spring Boot backend connecting via JDBC as superuser/table-owner will bypass RLS and operate normally.

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE flyway_schema_history ENABLE ROW LEVEL SECURITY;
