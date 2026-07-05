-- Create performance indexes for carbon logs aggregations
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, log_date);

-- Create active goals lookup index
CREATE INDEX idx_goals_user_status ON goals(user_id, status);

-- Create index for user achievements badges queries
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
