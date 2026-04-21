# Accessibility Fixes

[Source](https://ace.useit.se/ax/accessibility-issues.php?show=1440&shared=5817700361107562)

This document follows the same issue order as the accessibility report and explains what was changed in the code.

## Priority: High

### 1. Visually designed headings are not coded with heading elements
Status: Fixed

What we did:
- We changed text that only looked like headings into real heading elements where needed.
- This was done in search results, theme cards, dataset/resource sections, and shared heading components.
- The visual design stays the same, but screen readers can now understand the page structure better.

### 2. English content is not marked up correctly in the code
Status: Partly fixed

What we did:
- We replaced hardcoded English control labels with translated text where possible.
- We added support so translated CKAN content can carry the correct `lang` attribute when fallback text is shown.

What still remains:
- If the source content in CKAN mixes languages inside the same field, frontend code cannot fully fix that.
- Those cases still need content cleanup in the source data.


### 3. Heading structures lack heading levels
Status: Fixed

What we did:
- We cleaned up the heading order so pages follow a more logical structure.
- This was adjusted across the homepage, themes page, dataset page, resource page, and search results.
- The goal was to improve structure without changing the look.

### 4. Visual lists lack proper semantic encoding
Status: Fixed

What we did:
- We changed visual-only groups of items into real lists where appropriate.
- This includes search results, filters, tags, resources, and metadata sections.
- For metadata, we kept the same look but used definition list markup underneath.

### 5. Search result information is not marked as a status message
Status: Fixed

What we did:
- We marked the search result summary as a live status message.
- This means screen readers now announce result updates when the search changes.

### 6. Images of maps are not described with alt texts
Status: Fixed

What we did:
- We added a screen-reader description for map previews.
- GeoJSON and OGC map previews are now wrapped so assistive technology gets a meaningful label.

### 7. Decorative vector graphics are not hidden from assistive devices
Status: Fixed

What we did:
- We hid decorative graphics and icons from screen readers where they do not add meaning.
- This includes decorative graphics in cards and hero visuals.

## Priority: Medium

### 8. Some text against a background has too low contrast
Status: Fixed

What we did:
- We kept the existing hero design and reduced the opacity of the decorative hero image so text reads more clearly on top of it.
- We also adjusted some text color usage to improve readability while keeping the current design.

### 9. Notifications about missing search results do not help users correct their search
Status: Fixed

What we did:
- We improved the no-results message so it helps the user recover.
- We added short guidance and a direct link to browse all datasets.

### 10. Filtering changes content in an unexpected way and hides other filters
Status: Fixed

What we did:
- We made the filter panel more stable so selected options do not disappear unexpectedly.
- We keep active filter choices visible and only show filter controls when they are actually available.
- This keeps the existing filtering UI, but makes it more predictable.

### 11. The website does not respect the user's dark mode setting
Status: Deferred

What we did:
- We did not implement dark mode as part of this round.
- This needs its own scope because it affects many parts of the interface and would require broader design and development work.
- It should be planned and handled separately so it can be done properly without introducing regressions.

## Notes

- The changes were made with a minimal-impact approach because the site is already in production.
- Where possible, we improved semantics and accessibility without changing layout or visual design.
- If more content issues are found in CKAN-managed text, those may still need editorial cleanup outside the frontend.
