This is an example of fixes and improvements I made to existing code that 
had been in production. It was originally produced by outsourcing to another
development shop. This fix included optimizations, simplification, and bug fixes.

It is the controller for a drag n drop component in a DIY website builder which
was built and maintained by SquareHook. It allows a user to build a tabbed 
section on their website. 

Notes:
The tabSquareOld.js version of the file used an instance of a text editor PER tab.
Part of the improvements I made was abstracting the logic to use only one instance
of the text editor to make changes to all the tabs. 