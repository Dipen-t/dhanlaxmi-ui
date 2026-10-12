# dhanlaxmi-ui

Dhanlaxmi Catering website.

A responsive catering website built with plain HTML and CSS, plus a small vanilla JavaScript file for menu tabs, mobile navigation, and a downloadable event brief. No framework, package installation, or build step is needed.

## Preview

Open `index.html` directly, or run `node preview.mjs` from this directory and visit `http://127.0.0.1:8080`.

## Phases

1. Design skill setup and visual direction: Prata display type, Manrope body type, deep ruby with white surfaces, and food-led imagery.
2. Build: occasions for celebrations and corporate events, three sample menus, service approach, and an event planner.
3. Verify: desktop/mobile layouts, keyboard interaction, tabs, form validation, and event-brief download.

## Demo scope

The business name, 25+ years of experience, service across Maharashtra, and primary phone number are supplied business details; see BUSINESS.md. Menus remain illustrative and food photography is generated. The event planner prepares a WhatsApp enquiry for +91 80802 00800 and offers a text download. The visitor reviews and sends the WhatsApp message; there is no automatic submission or booking confirmation.

Google Fonts provides Prata and Manrope; local Georgia and Arial fallbacks are included. All photography is stored in `assets/`.

## About Us & motion

The About Us copy uses the supplied business experience and service area, accompanied by an original AI-created representative kitchen photograph. Two authored geometric SVG rosettes and an inline plate seal extend the visual identity.

`motion.js` adds a one-time opening sequence, varied section reveals, scroll-linked photo movement, a moving text ribbon, a drawn plate seal, reading progress, and active navigation. Menu and dialog changes have short feedback animations. Effects use browser APIs with no animation-library dependency. Content is visible by default, scroll remains native, offscreen effects stop updating, and the system reduced-motion setting disables spatial animation. Geometry is cached outside scroll handling and updates are batched with requestAnimationFrame.

The gesture upgrade adds locally vendored Lenis 1.3.26 for wheel smoothing and anchor navigation, with native touch scrolling. `delight.js` provides restrained magnetic buttons and image tilt and light. The standard cursor is preserved throughout. Headings reveal word by word and replay when re-entering the viewport. Lenis pauses while the event dialog is open and is destroyed while the page is hidden; nested dialog scrolling remains native. Third-party licensing is in `assets/vendor/LENIS-LICENSE.txt`.

About Us now has a scroll-scrubbed photo composition: five aligned image columns assemble into the kitchen photograph, transparent spice and mint/lime assets move at different depths, and a smaller feast photograph settles into place. Scroll effects reverse with scrolling rather than running on a timer. All photography and ingredient cutouts are generated project assets. The ingredients have verified alpha transparency and optimized WebP variants. Reduced motion displays the complete photograph and static ingredients; the same content remains visible without JavaScript.

Visual research: [Judy Doherty food motion](https://www.judydohertyphotography.com/motion-video-gif) and [Ingredient content packages](https://www.ingredientcreative.com/content-packages). Research informed the ingredient/preparation direction; their media was not copied.
