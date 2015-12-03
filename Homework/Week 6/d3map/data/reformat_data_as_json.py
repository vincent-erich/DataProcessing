#!usr/bin/python

'''
reformat_data_as_json.py 

Reformats the data in 'sp.pop.totl_Indicator_en_csv_v2.csv' and writes the
reformatted data as a JSON string to 'data.json'. The JSON string is an
object (python dictionary) with two properties (keys): 'fills' and 'data'. The
data (JSON string) is such that it is compatible with that expected by 
datamaps.

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
	json_representation = obtain_data()
	write_data(json_representation)


'''
Obtains the required data (i.e., 'fills' and 'data').
'''
def obtain_data():
	json_representation = {}
	json_representation["fills"] = obtain_fills()
	json_representation["data"] = read_data()
	return json_representation


'''
Obtains the right fill colors.
'''
def obtain_fills():
	fills = {}
	fills["level1"] = "#fcfbfd"
	fills["level2"] = "#efedf5"
	fills["level3"] = "#dadaeb"
	fills["level4"] = "#bcbddc"
	fills["level5"] = "#9e9ac8"
	fills["level6"] = "#807dba"
	fills["level7"] = "#6a51a3"
	fills["level8"] = "#54278f"
	fills["level9"] = "#3f007d"
	fills["defaultFill"] = "#fee0d2"
	return fills


'''
Opens the file 'sp.pop.totl_Indicator_en_csv_v2.csv' for reading, and reads
all the rows in that file. If a row is relevant (i.e., it is not meta-data),
then extract the country name, country code, and population (in 2014) from it,
and use this information to construct a 'country_data' object (python
dictionary). Append this object to the 'data' object (also a python 
dictionary). Return the latter object when all the rows have been read.
'''
def read_data():
	data = {}
	with open("sp.pop.totl_Indicator_en_csv_v2.csv", "rb") as input_file:
		reader = csv.reader(input_file)
		row_number = 0
		for row in reader:
			# The first five rows are redundant.
			if row_number < 5:
				row_number += 1
				continue

			country_data = {}
			country_name = row[0]
			if country_name == "Not classified":
				continue
			country_code = row[1]
			country_population_2014 = int(row[58])
			fill_key = get_fill_key(country_population_2014)
			country_data["population"] = country_population_2014
			country_data["fillKey"] = fill_key
			data[country_code] = country_data

	return data


'''
Returns the right fill key for a population.
'''
def get_fill_key(population):
	if population < 5000000:
		return "level1"
	elif population < 10000000:
		return "level2"
	elif population < 25000000:
		return "level3"
	elif population < 50000000:
		return "level4"
	elif population < 75000000:
		return "level5"
	elif population < 100000000:
		return "level6"
	elif population < 200000000:
		return "level7"
	elif population < 1000000000:
		return "level8"
	else:
		return "level9"


'''
Opens the file 'data.json' for writing, and writes the object (python
dictionary) 'json_representation' as a JSON string to this file.
'''
def write_data(json_representation):
	json_string = json.dumps(json_representation)
	with open("data.json", "wb+") as output_file:
		output_file.write(json_string)


if __name__ == "__main__":
	main();	# Call into the program.
