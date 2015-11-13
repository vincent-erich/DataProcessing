#!usr/bin/env/python

'''
reformat_data.py

Reformats the data in 'KNMI_19950921.csv', and writes the reformatted data to
'KNMI_19950921_reformatted.csv'. The reformatted data contains two columns:
'date' and 'maxtemp' (the maximum temperature).   

Usage:
	reformat_data.py

Name: Vincent Erich
Student number: 10384081
'''

import csv


'''
The main function.
'''
def main():
	rows = read_data()
	write_data(rows)


'''
Opens the file 'KNMI_19950921.csv' for reading, and reads all the rows in this
file. If a row is relevant (i.e., it is not meta-data), then extract the date
and the maximum temperature from it, create a new row (with this information),
and store this (new) row in an array. Return the array when all the rows have
been read.
'''
def read_data():
	rows = []
	with open("KNMI_19950921.csv", "rb") as input_file:
		reader = csv.reader(input_file)
		for row in reader:
			# If the first element in 'row' is a string that starts with '#',
			# it is meta-data; continue.
			if row[0].startswith("#"):
				continue;
			else:
				date = row[1]
				# Place forward slashes in the date string, i.e:
				# '19940922' --> '1994/09/22'.
				modified_date = date[:4] + "/" + date[4:6] + "/" + date[6:]
				# Remove whitespace from the maximum temperature string.
				maxtemp = "".join(row[2].split())
				# Construct the row and append it to the array.
				modified_row = [modified_date, maxtemp]
				rows.append(modified_row)
	return rows


'''
Opens the file 'KNMI_19950921_reformatted.csv' for writing, and writes all the
rows in 'rows' to this file.
'''
def write_data(rows):
	with open("KNMI_19950921_reformatted.csv", "wb+") as output_file:
		writer = csv.writer(output_file)
		writer.writerow(["#date", "maxtemp"])	# Write the header.
		for row in rows:
			writer.writerow(row)


if __name__ == '__main__':
    main()  # Call into the progam.
