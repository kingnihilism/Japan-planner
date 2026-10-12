# Japan 2028 Travel Planner — V13

### Mobile backup controls

On phones and tablets, use the **DATA & BACKUPS** button in the page header to access Export JSON, Import full backup, Merge Social Finds, and Reset sample data.

A local-first trip command center built with vanilla HTML, CSS, and JavaScript. Its authoritative itinerary and figures come from the corrected **Japan 2028 Trip** spreadsheet.

## More V13 planning tools

- **Today in Japan**: choose a trip day to preview the overnight hotel/address, transfer route and luggage notes, activity times, maps, transit details, weather/laundry notes and bookings. Japan Today uses Asia/Tokyo dates; outside the trip it offers a clearly labeled preview. March 21 uses Kadensho, March 22–25 Kyoto Shichijo, March 26–30 Namba, and March 31 is checkout/departure.
- **Places → Schedule**: prefill an itinerary form with the saved name, city, neighborhood and notes. Select the date/time and save; the Place remains in your collection. Empty address, price and transit fields are left for you to complete.
- **Backup activities**: add an alternative in the itinerary editor, optionally filling it from a saved Place. Use Backup / Use Primary changes the active plan and its displayed cost while retaining the original. Switching does not cancel reservations, and the backup has a flexible time.
- **Bookings → Budget**: explicitly select an existing expense in the booking editor. Reserved/Paid booking amounts replace that expense's manual actual in displayed budget totals; Paid bookings contribute to paid totals. Several bookings can share an expense and are summed once. Planned/Cancelled contribute zero. Estimates remain unchanged, currency conversions follow the planning rate, and unlinking restores manual values. Deleting an expense unlinks its bookings. Unlinked bookings do not affect Budget.
- Existing V13 backups remain compatible. Scheduling notes, alternatives and booking links persist through saves and JSON imports/exports. Asset query strings are refreshed while the app remains V13.
- Fixed booking-value totals to read booking `price`, and made itinerary dates independent of the device timezone.

## V13 logistics update

All new tools are in **Logistics**:

- Four editable Japanese hotel address cards with a large Show Address dialog, copy control and official source links. Source details were checked October 12, 2026; recheck before travel.
- Four editable hotel/airport transfer plans for March 21, 22, 26 and 31, including checkout, arrival target, route, luggage handoff, essentials and saved readiness checklists.
- Separate outbound and return baggage plans, initially one and two checked suitcases. Enter your airline/fare, purchased bag allowance, per-suitcase weight limit, measured weights and shopping reserve. Airline limits start blank; they are not inferred from the planned bag count.
- Existing editable hotel dining details remain available inside each accommodation card.
- V1–V12 data migrates to V13 using the same browser storage key. New logistics data is included in JSON backups and is preserved by Reset Sample Data.
- The existing packing inventory is preserved. Its older duffel references can be edited if replacing it with a second spinner.

## V12 departure-date update

- Outbound departure is now March 14, 2028, with arrival in Japan on March 15.
- The countdown, flight tracker, deadline seed, and existing saved V11 data migrate automatically.
- The in-Japan daily itinerary remains March 15–31 and the lodging plan remains 16 nights.

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

- March 14, 2028 departure countdown and 16-night Japan route
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
- Automatic migration of V1–V11 records, including Travel Ops data introduced in V8

## Privacy and backups

Data remains on the current browser and device unless exported. Clearing site data can erase it, so export JSON backups regularly. V9 displays a backup reminder and validates imports before asking to replace current data.

## Design

The red, black, cream, and yellow interface uses an original graphic language inspired by stylish Japanese game menus. It does not reproduce Atlus artwork, characters, logos, fonts, music, or other proprietary assets.

## Optional V13 browser checks

The app still runs by opening `index.html`. To run the regression checks separately, install Node.js and run from this folder:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/logistics.cjs
```

The test starts its own local server, uses a separate headless browser, and does not touch your regular browser data. It checks checklist persistence, transfer editing, per-bag and bag-count warnings, safe address display, downloadable JSON backup and UI restore, preservation during sample reset, V12 migration, malformed-data handling, and phone-width layout. Browser installation may require system libraries; on supported Linux systems use `npx playwright install --with-deps chromium`.

### DOM checks without a browser download

```sh
npm install --no-save --package-lock=false jsdom
node tests/logistics-dom.cjs
node tests/planning-dom.cjs
```

These execute the real application with a DOM to verify form saves, migration, persistence, baggage warnings and safe address rendering. The planning checks also cover Japan timezone boundaries, daily hotel selection, scheduling saved Places, primary/backup switching, booking links and currency/payment changes. They do not verify visual layout.
