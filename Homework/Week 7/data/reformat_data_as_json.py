#usr/bin/python

'''
reformat_data_as_json.py 

Creates a JSON string with all the data for the dashboard. The JSON string is 
an object (python dictionary) with two properties (keys): 'fills' and 'data'.
The data (i.e., the whole JSON string) is such that it is compatible with that
expected by datamaps.
Below is an example of the structure of the JSON string. 

{
    'fills': {
        'popCategory1': 'color 1',
        'popCategory2': 'color 2',
        ...
        'popCategory9': 'color 9',
        'defaultFill': 'default color'
    },
    'data': {
        '1960': {
            'ANG': {
                'total': 'total population',
                'fillKey': 'popCategory2',
                'precentages': [
                    ['0-14', 'percentage 0-14'],
                    ['15-64', 'percentage 15-64'],
                    ['65+', 'percentage 65+']
                ]
            },
            'AUS': {
                ...
            },
            ... // Other countries (country codes).
        },
        ... // Other years.
        '2014': {
            ...
        }
    }
}

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
Obtains the right fill colors (i.e., this function returns the value for
'fills').
'''
def obtain_fills():
	fills = {}
	fills["popCategory1"] = "#fcfbfd"
	fills["popCategory2"] = "#efedf5"
	fills["popCategory3"] = "#dadaeb"
	fills["popCategory4"] = "#bcbddc"
	fills["popCategory5"] = "#9e9ac8"
	fills["popCategory6"] = "#807dba"
	fills["popCategory7"] = "#6a51a3"
	fills["popCategory8"] = "#54278f"
	fills["popCategory9"] = "#3f007d"
	fills["defaultFill"] = "#fee0d2"
	return fills


'''
Calls the function 'read_file(...)' with the right arguments to obtain all the
required data (i.e., this function returns the value for 'data').
'''
def read_data():
	data = {}
	data = read_file("total/sp.pop.totl_Indicator_en_csv_v2.csv", "total", data)
	data = read_file("0-14/sp.pop.0014.to.zs_Indicator_en_csv_v2.csv", "0-14", data)
	data = read_file("15-64/sp.pop.1564.to.zs_Indicator_en_csv_v2.csv", "15-64", data)
	data = read_file("65+/sp.pop.65up.to.zs_Indicator_en_csv_v2.csv", "65+", data)
	return data


'''
Opens the file 'file_name' for reading, and reads all the rows in that file.
If a row is relevant (i.e., it is not meta-data), then extract the country
name, country code, and the population/percentages from 1960-2014 from it.
Use this data to fill the dictionary 'data' (which is the value for 'data' in
the JSON string). 
'''
def read_file(file_name, key, data):
	with open(file_name) as input_file:
		reader = csv.reader(input_file)
		row_number = 0
		header_row = []
		# The first five rows, except for the fith row (index 4), are
		# redundant. The fifth row (the 'header row') is used for obtaining
		# the years. 
		for row in reader:
			if row_number < 5:
				if row_number == 4:
					header_row = row
				row_number += 1
				continue

			country_name = row[0]
			if country_name == "Not classified":
				continue
			country_code = row[1]

			# Obtain the population/percentages from 1960-2014 (there is no
			# data for 2015, hence the :-1).
			index = 4
			for column in row[4:-1]:
				year = header_row[index]

				if key == "total":
					if column == "":
						population = "Unknown"
						fill_key = "defaultFill"
					else:
						population = int(column)
						fill_key = get_fill_key(population)
					country_year_data = {key: population, "fillKey": fill_key, "percentages": []}
					if year in data:
						data[year][country_code] = country_year_data 
					else:
						data[year] = {country_code: country_year_data}
				
				else:
					if column == "":
						percentage = "Unknown"
					else:
						percentage = float(column)
					# Assumes that the total population is already processed
					# (and thus that all the years and country codes are
					# already in the dictionary)!
					data[year][country_code]["percentages"].append([key, percentage])

				index += 1
	return data


'''
Returns the right fill key for a population.
'''
def get_fill_key(population):
	if population < 5000000:
		return "popCategory1"
	elif population < 10000000:
		return "popCategory2"
	elif population < 25000000:
		return "popCategory3"
	elif population < 50000000:
		return "popCategory4"
	elif population < 75000000:
		return "popCategory5"
	elif population < 100000000:
		return "popCategory6"
	elif population < 200000000:
		return "popCategory7"
	elif population < 1000000000:
		return "popCategory8"
	else:
		return "popCategory9" 


'''
Opens the file 'data.json' for writing (if the file does not exist, it is
created), and writes the object (python dictionary) 'json_representation'
as a JSON string to this file.
'''
def write_data(json_representation):
	json_string = json.dumps(json_representation)
	with open("data.json", "wb+") as output_file:
		output_file.write(json_string)


if __name__ == "__main__":
	main()	# Call into the program.
