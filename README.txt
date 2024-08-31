*INSTRUCTIONS*

1.) Open the Koha Circulation module and select "Holds queue"
2.) Leave the collection dropdown set as "All" and click "Submit"
4.) Leave all default columns visible. Click "Export" and select "Excel"
6.) Click the "Browse..." or "Choose File" button on the page, locate the exported spreadsheet in the file explorer window that opens, and then press the "Process Spreadsheet" button
7.) Once the reformatted table is displayed in the browser, click the green "Print table" button. It is likely best to print as a double-sided landscape page.




*TROUBLESHOOTING*

The script is following a fairly simple set of rules. Deviations from the standard record could result in errors or exceptions to the formatting, so it might be useful to understand what's going on in the background...

The script works through the following steps to process the spreadsheet:

1.) Deletes the first row, the title row (i.e., "Holds queue › Circulation › Koha"), and shifts remaining rows up

2.) Finds and deletes the following strings: "or any available" (which is included in the barcode column), "& Autobiography", "Large Type Fiction", "Large Type Nonfiction", doubles of "DVD" and "Blu-Ray", and replaces "General Fiction with simply "Fiction" (which are all included in the call number column)

3.) Deletes any rows with " J ", " JP ", " JE ", " JB ", " BB ", "Board Books " or " JUV-" in the call number column (to eliminate children's materials, including the parenting collection)

4.) Checks for videogame item type and deletes all text after a ] (The videogame console is identified by brackets [Switch], [PS5], etc. so using that to clean up the remaining text in the title column).

5.) Sorts all rows by the call number column and then moves the column header row back to the top

6.) Processes the first column:
        -Identifies instances when there are numbers immediately before or after a '/' and deletes them and the slash (this step was a late addition to the script because '/'  is used in a later step but some slashes in the title column are for measurements, e.g., some movies or other media include measurements of the discs in the title column... this step deletes that use of '/' and the numbers so that the other steps work properly).

        -Removes all numbers from the first column that have more than three digits in a sequence (in order to delete the ISBN(s) and other numbers between the title and author).

	-Then removes any string of spaces more than two spaces long. 

	-Bolds all text in the first column that occurs before a '/' (usually the title is separated from the author with a '/' and I thought the bold would help distinguish the title from the author). 

	-Finally, deletes all text occurring after the following string of characters ", : " (this one is tricky! Look down the title column of an unprocessed holds queue report and find a book record, if you delete the numbers, then what remains in between the publisher and the page numbers is " , :" so this is an attempt to delete text after the author, but often settling for deleting text after the publisher).

7.) Deletes columns two ("Collection"), six ("Send to"), seven ("Date"), and eight ("Notes") and shifts remaining columns left

8.) Moves call number column to the first column

9.) Applies alternating row backgrounds

Feel free to download the files and repurpose for your own library. You can run all of this offline in a web browser if you have the files (index.html, script.js, and style.css) in the same directory or modify and upload them to your own github account. 

Access the files here: https://github.com/vclsean/adultholdslistreformatter/
Children's reformatter available here: https://vclsean.github.io/childrensholdslistreformatter/index.html
Files for children's reformatter here: https://github.com/vclsean/childrensholdslistreformatter

-SEAN (VCL)
