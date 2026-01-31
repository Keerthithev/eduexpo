# Registration Flow Update - TODO

## Backend Changes
- [x] 1. Modify register endpoint - accept only name and email, store temp data in OTP
- [x] 2. Modify verify-register endpoint - verify OTP and return success without creating user
- [x] 3. Add new set-password endpoint - create user with password after OTP verification
- [x] 4. Update auth routes with new endpoints
- [x] 5. Update OTP model to support tempData and verified fields

## Frontend Changes
- [x] 6. Update Register.jsx - Step 1: Full Name + Email only
- [x] 7. Update Register.jsx - Step 2: OTP verification
- [x] 8. Update Register.jsx - Step 3: Password + Confirm Password
- [x] 9. Update progress indicator to show 3 steps

## Testing
- [ ] 10. Test the complete registration flow

