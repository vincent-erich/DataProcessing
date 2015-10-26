# Name : Vincent Erich
# Student number : 10384081
'''
This module contains an implementation of split_string.
'''

# You are not allowed to use the standard string.split() function, use of the
# regular expression module, however, is allowed.
# To test your implementation use the test-exercise.py script.

# A note about the proper programming style in Python:
#
# Python uses indentation to define blocks and thus is sensitive to the
# whitespace you use. It is convention to use 4 spaces to indent your
# code. Never, ever mix tabs and spaces - that is a source of bugs and
# failures in Python programs.


def split_string(source, separators):
    '''
    Split a string <source> on any of the characters in <separators>.

    The ouput of this function should be a list of strings split at the
    positions of each of the separator characters.
    '''

    result = []

    if(source == ""):
    	'''
    	If the string <source> is empty, simply return the (empty) result
    	list.
    	'''
    	return result
    elif(separators == ""):
    	'''
    	If <separators> is empty, simply append the string <source> to
    	the result list and return the result list. 
    	''' 
    	result.append(source)
    	return result
    else:
    	'''
    	Loop over the characters in the string <source>. If the current
    	character is not one of the characters in <separators>, append it to 
    	the string <match>. If the current character is one of the characters
    	in <separators>, check whether the string <match> is not empty and, if
    	so, append the string <match> to the result list. 
    	'''
    	match = ""
    	for index in range(0, len(source)):
    		if(source[index] in separators):
    			if(match != ""):
    				result.append(match)
    			match = ""
    		else:
    			match += source[index]
    	'''
    	This (final) check is necessary for the case where the string <source>
    	does not end with a character that is in <separators>.  
    	'''
    	if(match != ""):
    		result.append(match)
    	return result


if __name__ == '__main__':
    # You can try to run your implementation here, that will not affect the
    # automated tests.
    print split_string('abacadabra', 'ab')  # should print: ['c', 'd', 'r']