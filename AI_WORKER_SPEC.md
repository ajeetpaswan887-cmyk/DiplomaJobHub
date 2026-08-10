# AI Job Finder Specification

Rule: AI finds -> validates -> Pending -> Publisher verifies -> Publish.

Accept only:
- Diploma Electrical Engineering
- Diploma Mechanical Engineering
- Diploma Civil Engineering
- Fresher / 0 experience (or clearly permits freshers)
- Current/open applications

Reject by default if mandatory experience is required, diploma is not eligible, the source is not official/authorized, the application is closed, or the branch is outside the target three.

If uncertain: Pending, never auto-publish.

Store source URL/name, discovered time, notification URL, apply URL, eligibility, extracted dates/salary/location, AI result and publisher action.

Deduplicate by normalized company + post + branch + deadline + apply URL.

Every AI-created listing remains pending until an authenticated Publisher publishes it.
