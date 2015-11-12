#!usr/bin/env/python
# Name: Vincent Erich
# Student number: 10384081

import csv


def main():
	rows = read_data()
	write_data(rows)


def read_data():
	rows = []
	with open("KNMI_19950921.csv", "rb") as input_file:
		reader = csv.reader(input_file)
		for row in reader:
			if row[0].startswith("#"):
				continue;
			else:
				date = row[1] 
				modified_date = date[:4] + "/" + date[4:6] + "/" + date[6:]
				maxtemp = "".join(row[2].split())
				modified_row = [modified_date, maxtemp]
				rows.append(modified_row)
	return rows


def write_data(rows):
	with open("KNMI_19950921_reformatted.csv", "wb+") as output_file:
		writer = csv.writer(output_file)
		writer.writerow(["#date", "maxtemp"])
		for row in rows:
			writer.writerow(row)


if __name__ == '__main__':
    main()  # Call into the progam.
