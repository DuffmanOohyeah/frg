#!/bin/bash -ex

INFILE="$1"

if [[ $INFILE != *.md ]]; then
    echo >&2 'Not a markdown'
    exit 1
fi

if [[ ! -f $INFILE ]]; then
    echo >&2 'File does not exist'
    exit 1
fi

OUTFILE="$(echo "$INFILE" | sed 's/\.md$/.docx/')"

TMP_DIR=$(mktemp -d -t todocx-XXXXXXXXXX)

cp "$INFILE" "$TMP_DIR/doc.md"

(cd "$TMP_DIR" && docker run --rm -i --user "$(id -u)":"$(id -g)" -v "$(pwd)":/pandoc geometalab/pandoc pandoc --columns 10 -s -o doc.docx ./doc.md)

cp "$TMP_DIR/doc.docx" "$OUTFILE"

rm -rf "$TMP_DIR/"
