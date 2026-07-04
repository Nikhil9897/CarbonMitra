-- Create Organizations Table
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    provider VARCHAR(50) DEFAULT 'LOCAL',
    organization_id BIGINT,
    CONSTRAINT fk_user_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- Circular references resolved via ALTER
ALTER TABLE organizations ADD COLUMN admin_user_id BIGINT;
ALTER TABLE organizations ADD CONSTRAINT fk_organization_admin_user FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create Emission Factors Table
CREATE TABLE emission_factors (
    id BIGSERIAL PRIMARY KEY,
    activity_type VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(50) NOT NULL,
    kg_co2e_per_unit DOUBLE PRECISION NOT NULL,
    source VARCHAR(255),
    effective_date DATE NOT NULL
);

-- Create Activity Logs Table
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) NOT NULL,
    co2e DOUBLE PRECISION NOT NULL,
    log_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Goals Table
CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_reduction DOUBLE PRECISION NOT NULL,
    period_days INT NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Badges Table
CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL,
    threshold DOUBLE PRECISION NOT NULL
);

-- Create User Badges Table
CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_badge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badge_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);
