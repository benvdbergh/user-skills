**CRITICAL: You MUST complete these steps in order. Do not skip ahead to writing code.**

This file is vendored from the upstream `claude-office-skills` repo.

If you need to fill out a PDF form, first check to see if the PDF has fillable form fields. Run this script from this file's directory:
`python scripts/check_fillable_fields <file.pdf>`, and depending on the result go to either the "Fillable fields" or "Non-fillable fields" and follow those instructions.

---

# Fillable fields

If the PDF has fillable form fields:

- Run this script from this file's directory: `python scripts/extract_form_field_info.py <input.pdf> <field_info.json>`. It will create a JSON file with a list of fields.
- Convert the PDF to PNGs (one image for each page) with: `python scripts/convert_pdf_to_images.py <file.pdf> <output_directory>`
- Create a `field_values.json` with field ids and values.
- Fill: `python scripts/fill_fillable_fields.py <input pdf> <field_values.json> <output pdf>`

---

# Non-fillable fields

If the PDF doesn't have fillable form fields, you'll need to visually determine where the data should be added and create text annotations.

Follow the below steps exactly:

- Convert the PDF to PNG images and determine field bounding boxes.
- Create a JSON file with field information and validation images showing the bounding boxes.
- Validate the the bounding boxes.
- Use the bounding boxes to fill in the form.

See the upstream reference for detailed JSON schema and validation steps.

