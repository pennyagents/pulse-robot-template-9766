/*
  # Add notifications table for user communication

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text, notification title)
      - `message` (text, notification content)
      - `type` (enum, notification type: info, success, warning, error)
      - `target_audience` (enum, who should see it: all, registered_users, specific_category)
      - `category_id` (uuid, optional foreign key to categories)
      - `is_active` (boolean, whether notification is active)
      - `priority` (integer, display priority)
      - `expires_at` (timestamp, when notification expires)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. New Enums
    - `notification_type` (info, success, warning, error)
    - `notification_audience` (all, registered_users, specific_category)

  3. Security
    - Enable RLS on `notifications` table
    - Add policy for public read access to active notifications
    - Add policy for admin management