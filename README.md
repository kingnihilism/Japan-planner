# Japan 2028 Travel Planner — V11🍙

### Mobile backup controls

On phones and tablets, use the **DATA & BACKUPS** button in the page header to access Export JSON, Import full backup, Merge Social Finds, and Reset sample data.

A local-first trip command center built with vanilla HTML, CSS, and JavaScript. Its authoritative itinerary and figures come from the corrected **Japan 2028 Trip** spreadsheet.

## V11 location update

- Research, Social Finds, and Places now share the same structured location selector.
- Choose one city, multiple cities, another city/area, or Nationwide/general.
- Tokyo, Kyoto, and Osaka reveal multi-select neighborhood lists.
- Multiple-city records can also include custom locations such as Nara, Kobe, Yokohama, or Hakone.
- Existing V10 records migrate automatically and remain editable.

## Run

Open `index.html` in a modern browser. If local-file restrictions interfere, run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`.

## V10 Social Finds import

- Dedicated **Merge Social Finds** importer for partial research packages
- Adds new TikTok records without replacing budgets, bookings, itinerary, or other planner data
- Deduplicates imported records by TikTok video ID
- Validates package type, structure, record count, and file size before merging
- Requires confirmation and reports the exact number of new records

## V9 reliability upgrades

- Visible local-save status and last-save time
- Backup reminders after ten changes or seven days without an export
- 5 MB import limit, collection/type checks, record-count limits, and actionable errors
- Schema version 10 with automatic migration of V1–V9 backups
- Duplicate blocking for research and places
- Confirmation before imports, deletion, and sample resets
- Reset Sample Data restores spreadsheet seeds while preserving user-created records
- Seed/user origin metadata keeps spreadsheet content separate from personal entries
- Focus restoration, keyboard focus trapping, visible focus rings, and live save announcements
- Phone and tablet layout refinements
- Print-friendly itinerary and emergency sheet

## Full scope

- March 15–31, 2028 countdown and 16-night route
- Editable expense manager seeded with the corrected $6,457 budget
- Estimated and actual costs, paid status, due dates, notes, automatic totals, and budget warnings
- $807.13 post-graduation savings schedule with an editable current-savings amount
- Seventeen-day itinerary covering March 15–31, 2028
- Morning, afternoon, and evening plans with city, neighborhood, reservation time, address/map link, transit notes, confirmation number, and fixed/flexible status
- USD or JPY activity costs with an adjustable planning exchange rate and automatic conversions
- Editable deadline timeline seeded with the original eighteen milestones
- Add, edit, delete, complete, reopen, categorize, and filter deadlines
- USD or JPY deadline costs using the shared planning exchange rate
- Automatic overdue, upcoming (within 30 days), scheduled, and completed indicators
- Dedicated booking tracker for flights, hotels, Shinkansen, attractions, connectivity, airport transportation, and travel insurance
- Booking status, provider, booking/use dates, USD or JPY price, confirmation number, cancellation deadline, official link, and notes
- Booking-category filters, reserved/paid progress, active booking value, and cancellation warnings
- Interactive packing checklist with add, edit, delete, pack, and unpack controls
- Packed count, percentage, and visual progress bar
- Categories, quantities, checked/carry-on/personal-item assignment, wear-in-transit, and Buy in Japan status
- Prominent medication and document warnings with a remaining-warning count
- Travel Ops workspace with transit, medication/customs, emergency, document, and trip-care tabs
- Editable comparison for IC cards, individual Shinkansen tickets, and regional passes with USD/JPY costs
- Medication, health, customs, and document-readiness checklist
- Local emergency-reference form for embassy, insurance, allergies, medications, and contacts
- Document vault index that stores location references rather than sensitive scans
- Seventeen-day manual weather, rain, and laundry plan
- Eighteen-step booking and compliance timeline
- General Research Inbox with verification and promotion workflow
- Dedicated TikTok/Instagram discovery inbox using city, neighborhood, spot, category, key order/tip, priority, and source link
- Thirty-one fandom, occult-history, nightlife, shopping, tarot, gaming, and cultural Places
- Four lodging bases and luggage/transit choreography
- Searchable capsule packing system
- Editable practical Tips
- LocalStorage persistence plus versioned JSON import/export
- Automatic migration of V1–V8 records, including Travel Ops data introduced in V8

## Privacy and backups

Data remains on the current browser and device unless exported. Clearing site data can erase it, so export JSON backups regularly. V9 displays a backup reminder and validates imports before asking to replace current data.

## Design

The red, black, cream, and yellow interface uses an original graphic language inspired by stylish Japanese game menus. It does not reproduce Atlus artwork, characters, logos, fonts, music, or other proprietary assets.
