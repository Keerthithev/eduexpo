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
- [x] 10. Login page UI/UX improvements with self-learning image
- [x] 11. Create unified Auth page with smooth swipe animations (removed animation per feedback)
- [x] 12. Match ForgotPassword theme with Auth page
- [x] 13. Create professional Landing page for http://localhost:5173/

