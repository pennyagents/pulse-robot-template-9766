-- Create a function to update registration status with proper admin context
CREATE OR REPLACE FUNCTION update_registration_status(
  p_registration_id uuid,
  p_status application_status,
  p_admin_username text DEFAULT 'admin'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record record;
BEGIN
  -- Update the registration
  UPDATE public.registrations 
  SET 
    status = p_status,
    updated_at = now(),
    approved_date = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
    approved_by = CASE WHEN p_status = 'approved' THEN p_admin_username ELSE NULL END
  WHERE id = p_registration_id
  RETURNING * INTO result_record;
  
  -- Check if any row was updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration with ID % not found', p_registration_id;
  END IF;
  
  -- Return success response with updated record
  RETURN json_build_object(
    'success', true,
    'message', 'Registration status updated successfully',
    'data', row_to_json(result_record)
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;