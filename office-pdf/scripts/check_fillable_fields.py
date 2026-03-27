import sys

from pypdf import PdfReader


# Script for Claude to run to determine whether a PDF has fillable form fields. See FORMS.md.


def main():
    reader = PdfReader(sys.argv[1])
    if reader.get_fields():
        print("This PDF has fillable form fields")
    else:
        print(
            "This PDF does not have fillable form fields; you will need to visually determine where to enter data"
        )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: check_fillable_fields.py [input pdf]")
        sys.exit(1)
    main()

