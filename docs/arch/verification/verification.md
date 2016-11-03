## Verification
`Verification` nodes are created/updated for each verification request. Verification has a type ('email' or 'phone'),
the value (email address or phone number) and a generated code.

![Verification Request](flow_request.puml)

To check whether an email or phone etc is verified.
This call does not store anything. Every time an email or phone is to be checked, the verification code must be sent.

![Verify](flow_verify.puml)