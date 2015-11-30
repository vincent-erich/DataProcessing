#!usr/bin/python

'''
reformat_data_as_json.py

Reformats the data in 'KNMI_19950921.csv' and writes the reformatted data as
a JSON string to 'KNMI_19950921_reformatted.json'. The JSON string represents
an array with arrays. Every array inside the first array contains a date
string and a maximum temperature.

Usage:
	reformat_data_as_json.py

Name: Vincent Erich
Student number: 10384081
'''

import csv
import json


'''
The main function.
'''
def main():
	json_representation = read_data()
	write_data(json_representation)


'''
Opens the file 'KNMI_19950921.csv' for reading, and reads all the rows in this
file. If a row is relevant (i.e., it is not meta-data), then extract the date
and the maximum temperature from it, create an array with this information, 
and store this array in another array. Return the latter array when all the
rows have been read.
''' 
def read_data():
	json_representation = []
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
				# data_point = {"date": modified_date, "maxtemp": maxtemp}
				data_point = [modified_date, maxtemp]
				json_representation.append(data_point)			
	return json_representation


'''
Opens the file 'KNMI_19950921_reformatted.json' for writing, and writes the
array 'json_representation' as a JSON string to this file.
'''
def write_data(json_representation):
	json_string = json.dumps(json_representation)
	with open("KNMI_19950921_reformatted.json", "wb+") as output_file:
		output_file.write(json_string)


if __name__ == "__main__":
	main()	# Call into the program.