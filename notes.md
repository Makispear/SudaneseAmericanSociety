```powershell
Compress-Archive -Path .\api\* -DestinationPath .\api.zip -Force
```

```powershell
Compress-Archive -Path .\email\* -DestinationPath .\email.zip -Force
```

## NOTES

- AWS Cognito? check it
- dead-letter queue (for async events. Send error there?)
- errors must be visible in cloudwatch but now in response.
- I have email_verified_at and is_email_verified. They can be reduced to one maybe. Look into it.
- Consider invalidating previous unused reset tokens for that user. for password forgots

### Account/Auth API Roadmap

- [ ] Logout
- [ ] Get My Account
- [ ] Update Profile
- [ ] Get Dependents
- [ ] Add Dependent
- [ ] Update Dependent
- [ ] Remove Dependent
- [ ] Refresh Token
- [ ] Session Management
- [ ] Logout Everywhere
- [ ] Deactivate Account
- [ ] Delete Account

## Next:

Memberships → Payments → Subscriptions → Admin
