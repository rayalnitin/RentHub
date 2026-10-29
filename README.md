# RentHub

A web app for renting apartments. Landlords post listings, renters mark favourites and send inquiries, and everyone can discuss a listing through comments and replies.

## Links

- **Deployed application:** https://rent-hub-official.netlify.app
- **GitHub repository:** <paste your GitHub link here>

## Login credentials

| Role          | Email             | Password  |
| ------------- | ----------------- | --------- |
| Renter (demo) | demo@renthub.com  | Demo@123  |
| Landlord      | priya@renthub.com | Priya@123 |
| Landlord      | rahul@renthub.com | Rahul@123 |

New accounts can also be created from the Register page.

## Bonus attempted

- **Preview and Submit screen** for a post. After filling the create form, the user sees a preview of the post and can go back to edit or submit. The same screen is used when editing an existing post.

## Features

- **Authentication:** register and login with validation; the session survives a page refresh
- **Auth guards:** only logged-in users can create, edit or preview posts and open the profile; logged-in users are redirected away from login and register; after login the user returns to the page they wanted
- **Routing:** lazy-loaded feature modules, route parameters (`/listings/:id`), and a 404 page
- **Home page:** carousel of the newest listings, featured panel, listing cards with View Details and Mark as Favorite, pagination (6 per page)
- **Search, filter and sort:** text search (title, address, building, type); filters for rent range, property type, bedrooms, furnished, lease type and amenities; sort by newest or price
- **Listing details:** photo gallery, full details, amenities, contact details (login required), favourite button
- **Comments and replies:** logged-in users can comment and reply; the listing owner's messages carry an "Owner" badge
- **Inquiries:** logged-in users can send an inquiry to the owner; owners see inquiries in their profile
- **Create and edit listing:** every wireframe field, with validation on all inputs, a live character counter (1400 characters), and photo links that are checked to be real, loadable images
- **Profile page:** My Listings (edit and delete), Favourites, Inquiries Received, Inquiries Sent
- **Responsive design:** works on phone, tablet and desktop (Tailwind CSS)

## Form validation

Reactive Forms with built-in validators (required, email, min/max, length, pattern) and a custom validator that rejects text made only of spaces. Errors appear under each field once it has been touched, and an error summary appears at the top of the create form on submit.

## Tech stack

- Angular (module-based, Angular CLI 22.2.4), TypeScript
- Tailwind CSS
- Reactive Forms
- Vitest for unit tests

## Project structure

- `src/app/core/` models, services, route guards, seed data
- `src/app/shared/` SharedModule (navbar, listing card)
- `src/app/auth/` AuthModule (login, register)
- `src/app/listings/` ListingsModule (home, details, create/edit, preview)
- `src/app/profile/` ProfileModule (profile page)

## Run locally

    npm install
    ng serve

Then open http://localhost:4200

## Unit tests

    ng test --watch=false

26 tests in 4 spec files:

- **Service:** `AuthService` (`auth.service.spec.ts`) and `ListingService` (`listing.service.spec.ts`)
- **Component:** `Login` (`login.spec.ts`)
- **Module:** `SharedModule`, including its `Navbar` and `ListingCard` components (`shared-module.spec.ts`)

## Notes and assumptions

- There is no backend. All data is kept in the browser's localStorage and is reached only through Angular services. Sample users, listings and comments are added the first time the app opens. Data is per browser, so listings added on one device are not visible on another.
- Passwords are stored as plain text because this is a demo. A real application would hash them on a server and enforce permissions there.
- Photos are added as image links (sample photos are available with one click).
- Login and Register are separate pages (`/auth/login`, `/auth/register`) so each can have its own route and guard.
- "Choose your Apartment/Building" is implemented as a property type dropdown plus a building name field.
- The vegetarian preference from the form description is a radio group (No preference / Vegetarian only).
- To reset the sample data, clear the site's localStorage and refresh the page.
