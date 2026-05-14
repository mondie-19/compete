-- SQL Script to setup Webhook Trigger for Payout Notifications
-- Run this in your Supabase SQL Editor

-- 1. Enable the pg_net extension if it isn't already enabled
create extension if not exists pg_net;

-- 2. Create the webhook trigger function
create or replace function public.handle_payout_webhook()
returns trigger as $$
declare
  webhook_url text;
begin
  -- Replace this URL with your production Next.js API URL
  -- Example: 'https://yourdomain.com/api/webhooks/payout'
  -- Or for local testing via ngrok: 'https://your-ngrok-url.ngrok-free.app/api/webhooks/payout'
  webhook_url := current_setting('app.settings.payout_webhook_url', true);
  
  if webhook_url is null or webhook_url = '' then
    -- Fallback for local development if setting is not configured
    -- NOTE: In local dev without ngrok, pg_net might not be able to reach localhost.
    webhook_url := 'http://host.docker.internal:3000/api/webhooks/payout'; 
  end if;

  perform net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', case when TG_OP = 'UPDATE' then row_to_json(OLD) else null end
    )::jsonb
  );
  
  return NEW;
end;
$$ language plpgsql security definer;

-- 3. Create the trigger on the 'challenges' table
drop trigger if exists on_payout_resolved on public.challenges;

create trigger on_payout_resolved
  after update on public.challenges
  for each row
  when (OLD.status IS DISTINCT FROM 'resolved' AND NEW.status = 'resolved' AND NEW.winner_id IS NOT NULL)
  execute function public.handle_payout_webhook();
