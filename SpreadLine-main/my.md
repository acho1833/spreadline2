The goal of this project is to convert the code that is in SpreadLine-main/demo to React using the following technology

Next.js 16
Typescript
React
Shadcn/ui

Do not worry about SpreadLine-main/demo/backend when converting to React.  That is used to fetch the data that feeds the frontend.  I have already put the test data at SpreadLine-main/testData.json.  I also put the screenshot of the Spreadline at SpreadLine/screenshot/screen1.png  

Take a look at the screenshot as a reference but run the Spreadline with 'npm run start' from SpreadLine-main/demo/backend and go to

https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev

to see the visualization.  I want you to analyze the SVG being generated and how it works.  Make sure to test the functionality to click the pill shaped container that expands as well.  I need you to test all the functionality so that you understand how it works.

First, I need you to create DESIGN.md that describes how current code works that is easily understandable.  Put as much details as possible.

Second, I need you to create a PLAN.md of how we can convert the SpreadLine code to React.  I want step by step procedure where I can test each step.  Make sure it's following good React design and architecture.  Ultimately it should generate the same SVG and not just look and feel.  The goal is to achieve exactly same functionality.  

If you have suggestions then let me know

---------------------

I need you to read DESIGN.md and create a HTML version of this at app/design/page.tsx Use as much visualization as possible to explain things like Architecture, Sequence Diagram, and etc... to explain the design.  Pretend that you are the greatest reverse engineer and your job is to create a document that explains how it works.  You will use visualizations and other things to help understand as easy as possible.  For example, how does model attribute is being used and how the SVG is being generated.  You can run the Spreadline through https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to see what SVG is being generated and what test data is being used.  I put the test data at SpreadLine-main/testData.json as well.  Ultrathink to make this document the best reverse engineered document in the world.  You are best! If you have questions then ask

--------------------
I need design v2 of this at app/design2/page.tsx with the following details

* There is a slider and checkbox input at the top of the visualation on SpreadLine/screenshot/screen1.png.  What do they do and when should it be used?
* For the 'SVG DOM Structure'.  Can you also give example visualization of each block? For example, I don't get what you mean by 'Event annotations'.  If you can show the visualization then I can understand better.
* For the Data Strucutures.  There are some attribute that impacts the visualization like bandWidth, blockWith, heightExtents.  Could you make interactive visualization where I can test each of these attributes and how it impacts the visualization?
* Can you explain 'Point Contextualization' in more detail that is easy to understand?
* For 'Interaction Sequences'. I don't quite get the flow.  Can you explain it better?
* For 'State Management'. I don't quite get the flow.  Can you explain it better?

I am a visual learner so try to use as much visualization to make me understand.  If it can be interactive would even be better. Ultrathink and create a design v2 at app/design2/page.tsx

Like I said you can go to https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to understand the output and interact or get screenshots to be used to explain certain sections.  Or even use the SpreadLine/screenshot/screen1.png

------------------
I need you to read DESIGN.md and create a HTML version of this at app/design/page.tsx Use as much visualization as possible to explain things like Architecture, Sequence Diagram, and etc... to explain the design.  Pretend that you are the greatest reverse engineer and your job is to create a document that explains how it works.  You will use visualizations and other things to help understand as easy as possible.  For example, how does model attribute is being used and how the SVG is being generated.  You can run the Spreadline through https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to see what SVG is being generated and what test data is being used.  I put the test data at SpreadLine-main/testData.json as well.  Ultrathink to make this document the best reverse engineered document in the world.  You are best! If you have questions then ask

I need you to see app/design3 that explains the SpreadLine interactive guide.  You can run the Spreadline through https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to see what SVG is being generated and what test data is being used.  The code is in SpreadLine-main directory. I put the test data at SpreadLine-main/testData.json as well. I need you to make better version of app/design3.

Can you make the following improvements with Ultrathink?
* The carasole animation from Time Axis -> Ego Line -> Storylines -> Blocks.  Can you add the Block expansion and let me control each phase
* Block Expanstion Animation.  Can you let me click each phase Shift/Extend/Expand/Position?
* Point Contextualization interaction doesn't seem to work. visualization is not changing. It should also have moveY
* Filter Controls Deep Dive - The visualization is too narrow to see the lifespan.  Can you create a wider visualization with timeline to understand better?
* Statem Managment Flow - I really don't get what you mean.  Please re-do, this is terrible.  Make it better so that I can understand.
* The labels are showing on the right side.  It's suppose to show on the left side.  See SpreadLine/screenshot/screen1.png

Make it as interactive as possible and the greatest interactive guide in history

You can update at app/design4/page.tsx

------
The carousl doesn't show the eco line at all and Block expansion is not working as well.  you can go to https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to understand the output and interact or get screenshots to be used to explain certain sections.

Remove the 'Entity Lifespans on Timeline'.  I like 'Filtered Spreadline preview' better

Again, I don't get the 'State Management Flow'

Ultrathink and make this way better.  Make it so that even non-technical person can understand.

Create app/design5/page.tsx

----
I need you to look at https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/design6 which is a interative tutorail for SpreadLine.  The main goal of this project is to convert to react.  So say you are now converting to Nextjs with typescript.  I want you to create a design page at app/react-design1/page.tsx in this page you will layout what components you will create and explain the architecture.  For each component, show a demo on what it will look like.  I want you to create all codes under app/react-design1  so that later I can create iteration on next one like app/react-design2 .  I want you to actually create all code necessary.  In the end, I want you to show the final version that shows the full functionality.  You can see the working version at https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to understand the functionality and code is at SpreadLine-main directory.  I also have a screenshot at SpreadLine/screenshot/screen1.png

If possible I want you to make it interactive when you demo the components.  Also put a feature to view the component code with expansion button.  Ultrathink this and make it as visual as possible and interactive.  Make the greatest technical documents where any react developers can understand.  Cool demo would be where I can modify the testData.js and visualization changes as well.  You are the greatest react developer in the world and you are the best.  Create the best technical documents in history.

For each phase, I want you to show a demo on the code that is working so far.  The final phase should have the full functionality.
----
I need you to create app/react-design2 with the following enhancements
* You are not explaining component architecture well.  You show 'useSpreadLineData' but you're not explaining what it does or how it's being used.  It would be nice if yan visualize how each component laysout as well and how it maps to which svg code that it's managing.  Also the code section is not display it correctly.  I see this below for types.ts and other codes.  It's not readable so fix it

// Types 400">"text-purple-400">for SpreadLine components
400">"text-purple-400">export 400">"text-purple-400">interface Point {
  id: 400">"text-cyan-400">number;
  name: 400">"text-cyan-400">string;
  label: 400">"text-cyan-400">string;
  posX: 400">"text-cyan-400">number;
  posY: 400">"text-cyan-400">number;
  scaleX: 400">"text-cyan-400">number;  // PCA position (0-1)
  scaleY: 400">"text-cyan-400">number;  // PCA position (0-1)
  group: 400">"text-cyan-400">number;
  visibility: 400">'visible' | 400">'hidden';

  Also the visualization has some bugs.  I have attached a screenshot at screenshot/screen2.png.  The bugs are
  - When you expand, the white background is exceeding the pill shape container.  Also the line seems to be disconnecting as well
  - The line should show behind the pill container
  - Also fill the color the pill container instead of being transparent
  - The arrows are correct but it should be outside the container and not overlapping
  - Also provide a way in the demo where i can change the test data json and visualization should rerender.  Ultrathink the solution.

  Make sure the full demo is available on app/react-design2/demo


  ---------------------------------------------
  this is much better. on the demo i found the following bug

  - When clicking the pill container to expand, it does not work.  it seems i have to click the pill container border then it expands.  i want it to expand on pill container
  - I also want you to make the year to enable the pill container expansion. it should toggle when i click the year
  - When I expand year 2002 and 2004.  Storyline is no longer connected.  I have attached the screenshot of what it should look like screenshot/x1.png and your version on screenshot/x2.png
  - When I try to edit the data. It seems to not render with new values.  for example, when I change bandWidth it does nothing but blockWidth works.  Whenever test changes then reload the spreadline
  - for useSpreadLineData.  Can you use react-query? since we're using mock data you can just initialize with that data.  I just want you to use react query
 
  i want you to enhance the documentation with the following
  - in 'Component to SVG Mapping', I want you to show Props to each of the component.  Also show example visualization of each component

  Also https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev is available for you to test out the functionality.  For example, when you expand the pill container then all the storyline is still connected.  So test and fix it until storyline is connected

  ---------------------------------------------
  unfortunately, that still did not work.  Ultrathink the solution and create it under app/react-design4 and put the demo on app/react-design4/demo

    - When I expand year 2002 and 2004.  Storyline is no longer connected.  I have attached the screenshot of what it should look like screenshot/x1.png and your version on screenshot/x2.png
    - also see the expanded pill container.  the arrows in the line seems weird.  For example the one that is pointing to 'Jeffiner' the arrow is in opposite direction.
    - when I edit bandWidth, that still doesn't seem to work.  Create a dedicate button 'Refresh' button that updates the visualization. Make sure to test if it does reflect the data changes.  Just reload the entire spreadline when test data changes
    - In the block component, make the arrow to appear behind the node and the arrow is right at the border of the node. make sure the arrows are in correct direction
    - make sure FillLines work, they don't seem to be expanding. it does shift the right but it's expanding the solid line
    - also when block component is expanding and collapsing, it looks a bit weird.  it should stay in place and just increase/decrease the width.  the box container seems to move differnt location when it's collapsing.  also make it more performance as well.


-------------------------------------------
take a look at https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design3 and https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design3/demo  I need you to continue to fix bugs.  The code is located at app/react-design3 for you to review.

Here are the bugs and ultrathink the solution and output it to app/react-design5 and demo at app/react-design5/demo
    - When I expand year 2002 and 2004.  Storyline is no longer connected.  I have attached the screenshot of what it should look like screenshot/x1.png and your version on screenshot/x2.png. it looks like some line is not being expanded
    - when I edit bandWidth through test data editor, that still doesn't seem to work.  Create a dedicate button 'Refresh' button that updates the visualization. Make sure to test if it does reflect the data changes.  Just reload the entire spreadline when test data changes
    - In the block component, make the arrow seems to go bit into the node. it should be right at the border.  also the some of the arrow is pointing the wrong away see screenshot/x2.png on the second block component for 'Jennifier'
    - enhance the expand/collapse animation for the block component.  It should should expand to the right and expand. left side should not move at all

for the documentation, include a section on which components to implement first and how to test it.

-------------------------------------

The demo still have issues go to https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design5/demo verify the bug and fix it
- expand year 2003.  You will notice that storyline connection is disconnected for 'Jennifer Mankoff'
- expand year 2004 and look at the expanded container and arrow is completely inside the circle node.  i need the arrow just to the border of the circle node.  Also look at 'Jeniffer' arrow.  the line passes the circle node and the arrow is swung back.
- the animation to expand and collapse still seems really slow.  especially when you collapse, the other pill container seems to just shift left instead of being animated when it's expanding.  make sure that animation to collapse is the reverse to expand.

for the documentation, you went way off than https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design3.  Go back to this.  I just meant when I code this how should I start and which component I should start coding for.  Put all the information from react-design3.  Of course you can add more stuff that you think will help.

Ultrathink the solution and create it under app/react-design6 and demo for app/react-design6/demo

------------------------------------------
I need you to read https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design6 and https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design6/demo.


This is trying to convert this visualization https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to React Component.  The source code for that is SpreadLine and it's using D3.js.

What I meant to say is to use React and D3.js.  Try to use exact same logic for D3.js so that animation, look, and feel looks the same.  Try to be close as possible from the code in SpreadLine directory.  Ultrathink the solution and create the new documentation on app/react-design7 that explains it with the D3 and the demo to app/react-design7/demo



I want you to fix the demo for following bugs and ultrathink the solution.

You can test it on https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design5/demo

The demo still have issues go to https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design5/demo verify the bug and fix it
- expand year 2003.  You will notice that storyline connection is disconnected for 'Jennifer Mankoff'
- expand year 2004 and look at the expanded container and arrow is completely inside the circle node.  i need the arrow just to the border of the circle node.  Also look at 'Jeniffer' arrow.  the line passes the circle node and the arrow is swung back.
- the animation to expand and collapse still seems really slow.  especially when you collapse, the other pill container seems to just shift left instead of being animated when it's expanding.  make sure that animation to collapse is the reverse to expand.






Ok, my patience is running thin and this is now v7.  I really need your super computer programmer hat on and really fix the following issues

The demo still have issues go to https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design5/demo verify the bug and fix it
- expand year 2003.  You will notice that storyline connection is disconnected for 'Jennifer Mankoff'
- expand year 2004 and look at the expanded container and arrow is completely inside the circle node.  i need the arrow just to the border of the circle node.  Also look at 'Jeniffer' arrow.  the line passes the circle node and the arrow is swung back.
- the animation to expand and collapse still seems really slow.  especially when you collapse, the other pill container seems to just shift left instead of being animated when it's expanding.  make sure that animation to collapse is the reverse to expand.

for the documentation, you went way off than https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design3.  Go back to this.  I just meant when I code this how should I start and which component I should start coding for.  Put all the information from react-design3.  Of course you can add more stuff that you think will help.

Ultrathink the solution and create it under app/react-design6 and demo for app/react-design6/demo




---------------------------
I need you to read https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design7 and https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design7/demo.


This is trying to convert this visualization https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to React Component.  The source code for that is SpreadLine and it's using D3.js.

source code is avaialble at app/react-design7 and it did a good job but more work needs to be done.

I've attached the screenshot screenshot/y1.png which is the screen that non-react version is showing which expands on year 2004.  I did the same for react-desgin7/demo and save the screen at screenshot/y2.png

I need you to make the following changes and create app/design8 for documentation and demo at app/design8/demo
- Make the color scheme as light like screenshot/y1.png
- it's missing the slider to control number of years and the checkbox for Only show crossing lines
- for the box that has been expanded. it's not showing the label and there's links arrows which doesn't need to be.  Compare with y1.png and y2.png.  Research why by comparing the code from SpreadLine directory.  It should match with the react version

Ultrathink the solution.  Make it look exactly same as screenshot y1.png and make the d3 code as similar as possible.


-----------------------

I need you to read https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design11 and https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/react-design11/demo.


This is trying to convert this visualization https://reimagined-spoon-jj45xv6j7jjpcj6w6-5173.app.github.dev to React Component.  The source code for that is SpreadLine and it's using D3.js.

React component have already been created at app/react-desgin11 and now I need help converting python to node for the backend.  python code is located at SpreadLine-main. Fully analyze the code and understand it.

I need you to create app/node-design1 which contains all the information from react-design11 and react-design11/demo. put all the backend code at app/node-design1/backend.
As a first phase, try to emulate exactly what python is doing and transform to node.js using typescript. make sure to use types as much as possible.

Also, I want you to explain how the data is generated.  Figure out what the original data is, show it, explain it.  Then show what python transformed it into and explain it.  on the frontend, it will fetch the data through the api.  use next.js app router api.

Ultrathink it.  You are the greatest typescript developer who can tackle converting python code to node.js with typescript.  Explain the architecture in the documentation.  The documentation must be complete from end to end that is easily understandable with lots of visualization.  It must be comprenhensive.  Remember to create a demo at app/node-design1/demo  

I can't wait to see it and make sure the code quality is excellent and verify that it works. let me know if you have any questions.

--------------------------------------------------

I need you to convert python code api endpoint to next.js app router api.  create an api called 'nodeFetchSpreadLine1'  
you can create app/node-design/page.tsx that contains the documentation on how it's done.
put all the generated code all in a single directory app/api/nodeFetchSpreadLine1
here is an python endpoint you can use https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine to test it against your api.  The response of the data must match 100%. if not then fix it and test again.  continue until they are 100% same.  The converted code should match the same logic as python.  do not take any shortcuts or be lazy. your job is to convert the exact code logic from python to typescript.
source code is located at SpreadLine-main directory. fully analyze and understand the python code

For the documentation, create at app/node-design2
 - Create an architecture document
 - Explain the original raw data before python transforms it.  Show the raw data and the transformed data
 - Show the archiecture/design document on converting to typescript. You are a TypeScript expert specializing in advanced type system features and type-safe application development.
 - Create full comprehensive document with visualizations and information so that I can feed this document to AI to ask questions about it.  it must include everything to understand the solution on python to typescript conversion
 - Make sure to include how the data is being transformed step by step and why.  This documentation will be forwarded to a developer.  make sure to include all information needed for junior developers.
 - also as senior developer, include other design artifacts like sequence diagram and such. you can even provide sample input/output of the function and explain how data is being transformed step by step visually
 - you can also make the documentation interactive so that I can understand better
 - make sure that all images or interactions work

 Also create a demo page where you are showing 2 json output.  one from https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine and the new one that you created so that I can verify that they are the same

Ultrathink this and if you have any question then let me know


-----------------------------

i'm trying to understand how https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine works.  Can you analyze the source code from SpreadLine-main folder? focus purely only that endpoint which is made using python.  So I need you to

- Invoke https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine and so that you can reference this if you need it
- Fully review and analyze python code in SpreadLine-mail folder so that you understand fully.  you can even create unit test for that endpoint so that you can run it to completely understand it.
- Create a visual diagram how it's reading the input from the CSV file.  Explain what each CSV files are
- Explain how the input CSV is being transformed one step at a time that produces https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine explain it visually and even adding interactions will be very useful
- Assume that you're an archiect and create an architecture document 
- Create full comprehensive document with visualizations and information so that I can feed this document to AI to ask questions about it.  it must include everything to understand the solution on python to typescript conversion.  Also include all the python code that is used for https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine endpoint
- Make sure to include how the data is being transformed step by step and why.  This documentation will be forwarded to a developer.  make sure to include all information needed for junior developers.
- also as senior developer, include other design artifacts like sequence diagram and such. you can even provide sample input/output of the function and explain how data is being transformed step by step visually
- you can also make the documentation interactive so that I can understand better
- make sure that all images or interactions work

Ultrathink this and generate the documentation under app/node-design/page.tsx.  I want you to put entire documents under a single file.  It would be nice if you can crate interactions on how the data are being loaded, transformed one step at a time with explanations.  Add other artifacts that would help understand this easily.


--------------------------------------------------------------------------------------------
i'm trying to understand how https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine works.  Can you analyze the source code from SpreadLine-main folder? focus purely only that endpoint which is made using python.  So I need you to

- Invoke https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine and so that you can reference this if you need it
- Fully review and analyze python code in SpreadLine-mail folder so that you understand fully.  you can run the unit test by going into SpreadLine-main directory and run 'python ./test_fetchspreadline.py'
- Create a visual diagram how it's reading the input from the CSV file.  Explain what each CSV files are
- Explain how the input CSV is being transformed one step at a time that produces https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine explain it visually and even adding interactions will be very useful
- Assume that you're an archiect and create an architecture document 
- Create full comprehensive document with visualizations and information so that I can feed this document to AI to ask questions about it.  it must include everything to understand the solution on python to typescript conversion.  Also include all the python code that is used for https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine endpoint
- Make sure to include how the data is being transformed step by step and why.  This documentation will be forwarded to a developer.  make sure to include all information needed for junior developers.
- also as senior developer, include other design artifacts like sequence diagram and such. you can even provide sample input/output of the function and explain how data is being transformed step by step visually
- you can also make the documentation interactive so that I can understand better
- make sure that all images or interactions work

Ultrathink this and generate the documentation under app/node-design2/page.tsx.  I want you to put entire documents under a single file and don't use any tab layout.  Just layout it vertically.  You can put It would be nice if you can crate interactions on how the data are being loaded, transformed one step at a time with explanations.  Add other artifacts that would help understand this easily.

-----------------------------------------
I need you to convert python code api endpoint to next.js app router api.  create an api called 'nodeFetchSpreadLine2'  
you can create documentation at app/node-design3/page.tsx that contains the documentation on how it's done. if you create other components then put it in app/node-design3
put all the generated code all for the api in a single directory app/api/nodeFetchSpreadLine2
here is an python endpoint you can use https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine if you need to see it.  
you can run the unit test by going into SpreadLine-main directory and run 'python ./test_fetchspreadline.py'
create the same test in typescript and load the same csv files.  The response of the test must all pass. you will notice that the orders may differ and that is fine.  you do need to make sure that it is in the list and that object is equal. if not then fix it and test again.  continue until they are 100% of the tests are passing.  
The converted code should match the same logic as python.  do not take any shortcuts or be lazy. your job is to convert the exact code logic from python to typescript.
source code is located at SpreadLine-main directory. fully analyze and understand the python code

For the documentation, create at app/node-design3/page.tsx 
 - Create an architecture document
 - Explain the original raw data before python transforms it.  Show the raw data and the transformed data
 - Include comprehensive explanation of how each CSV is and explain each fields with examples
 - Show the archiecture/design document on converting to typescript. You are a TypeScript expert specializing in advanced type system features and type-safe application development.
 - Create full comprehensive document with visualizations and information so that I can feed this document to AI to ask questions about it.  it must include everything to understand the solution on python to typescript conversion
 - Make sure to include how the data is being transformed step by step and why.  This documentation will be forwarded to a developer.  make sure to include all information needed for junior developers.
 - also as senior developer, include other design artifacts like sequence diagram and such. you can even provide sample input/output of the function and explain how data is being transformed step by step visually
 - you can also make the documentation interactive so that I can understand better
 - make sure that all images or interactions work
 - make sure to include all neccessary code so that I can ask AI for clarifications
 - don't use any tabs and just layout the document vertically
 - Documentation must be complete under a single page. AI should not be asking for additional resources to understand when I need to ask it.

 Also create a demo page where you are showing 2 json output.  one from https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine and the new one so that I can verify.  I understand the json may not be exactly same due to being in different order but I want to see it.  you can put this under app/node-design3/demo

Ultrathink this and if you have any question then let me know

----------------------------------------------
do the following
- take a look at app/react-design1 and app/react-design1 demo.  this is for frontned design and a demo.  I now have an api at app/api/nodeFetchSpreadLine2 that gets the data for spreadline.  I want you to use this API instead of a dummy data instead for the spreadline
- take a look at app/node-design3 (design doc) and code in app/api/nodeFetchSpreadLine2 . 

I want you to create to create app/frontend1/page.tsx which combines the design doc for both frontend and backend.  create demo on app/frontend1/demo which uses the backend API.  The frontend from app/react-design1 is good but i found app/node-design3 lacking.  I need you to make as backend design doc as good or even better than frontend design.  I need a deep understanding of the backend.

for the backend design documentation
 - Create an architecture document
 - Explain the original raw data before python transforms it.  Show the raw data and the transformed data
 - Include comprehensive explanation of how each CSV is and explain each fields with examples
 - Show the archiecture/design document on converting to typescript. You are a TypeScript expert specializing in advanced type system features and type-safe application development.
 - Create full comprehensive document with visualizations and information so that I can feed this document to AI to ask questions about it.  it must include everything to understand the solution on python to typescript conversion
 - Make sure to include how the data is being transformed step by step and why.  This documentation will be forwarded to a developer.  make sure to include all information needed for junior developers.
 - also as senior developer, include other design artifacts like sequence diagram and such. you can even provide sample input/output of the function and explain how data is being transformed step by step visually
 - you can also make the documentation interactive so that I can understand better
 - make sure that all images or interactions work
 - make sure to include all neccessary code so that I can ask AI for clarifications
 - don't use any tabs and just layout the document vertically
 - Documentation must be complete under a single page. AI should not be asking for additional resources to understand when I need to ask it.
 - make it as visual and interactive as well so that I can understand. make sure it is easy to understand
 - make it look good and be creative

Let me know if you have questions and Ultrathink it



----------------------------------------------------------------------------

I'm trying to troubleshoot why API https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/api/nodeFetchSpreadLine3 is not matching up with API https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine

The source code for the first one is at app/api/nodeFetchSpreadLine3 and the other one is the original source which is at SpreadLine-main
- The response should have same structure
- the order of the items in the array can be in different order. as long as it's there and the item equals exactly like the source then it's fine
- you can go ahead create the unit test for typescript version so that it can be tested quicker.  The output match with expectedResult.json Make sure that all values match especially with coordination information.  The only thing that should be different is the order in the list but all values in the object must be equal.  Keep doing this until your test passes.

I want you to create a new end point for this at app/api/nodeFetchSpreadLine4 and create a demo at app/frontend3/demo.  You can get the frontend code from app/react-design11.  you should use the code as is but if you're having trouble let me know.  Also let me know if you have questions even while you are testing.

while testing and you can't figure out why the value is different than feel free to add trace log at SpreadLine-main, modify test_fetchspreadline.py, and run it by going into SpreadLine-main directory and run 'python ./test_fetchspreadline.py'

Ultrathink and you can do this!

---------------------------------------------------------------------------

use fullstack-development agent to do the following task

I am now at final phase of the design document.  The goal of the task is to create an Technical Design Document (TDD) that captures end-to-end details for a feature we want to implement

I already have the frontend code at app/frontend3 and the backend is at app/api/nodeFetchSpreadLine4.  I want you to fully review and analytic code to complete understanding. if you want you can put trace logs and run the code if you are not clear.  I need you to understand 100%.

The source code is the single source of truth. Do not invent components, APIs, or flows that are not evident in the code. If something is unclear or missing, explicitly state it as an assumption or an open question. Ask questions if you are not clear.

The only piece that are missing is that we will have another backend that will handle getting the source data.  Currently, it's getting from various CSV files but it will be in another API that is different server.  You do not need to implement design for that.  I only want you to create API contract on what the request and response should be with clear technical explanations.  Assume this would be external API but we have control over the API contract and what data should be returned.  Explain how SpreadLine backend should parse and ingest to current code.

There is already design document at app/frontend2/page.tsx or at https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/frontend2 so I want you to extend this and include the API contract information as well.

## Objectives

Generate a **formal Technical Design Document** that captures the end-to-end design of this system or feature, including:

## 1. Overview
## 2. Architecture
## 3. Components
### 3.1 Frontend
### 3.2 Backend
### 3.3 External Services
## 4. API Design
## 5. Data Models
## 6. Core Flows
## 7. Error Handling & Edge Cases
## 8. Non-Functional Requirements
## 9. Dependencies
## 10. Assumptions & Open Questions

For each section:
- Reference concrete files, modules, classes, or functions where applicable.
- Be explicit and precise.
- Use bullet points where helpful.

add additional information that you think is useful.  make the documentation to be interactive to understand better as well. not sure which part can be interactive but anywhere it can then do it.  be creative and include many visualizations like sequence diagram and such.



------------------
















You are a senior full-stack staff engineer and systems architect.

Your task is to generate a **Technical Design Document (TDD)** for the **SpreadLine feature**, based strictly on the provided source code.

The source code is the single source of truth. Do not invent components, APIs, or flows that are not evident in the code. If something is unclear or missing, explicitly list it as an assumption or an open question.

You must NOT modify the code. You cannot execute the repository directly — if runtime behavior is unclear, ask me for logs or outputs.

---

## Feature Focus

The feature being designed and documented is **SpreadLine**.

All analysis and documentation should focus on:
- How SpreadLine works
- How SpreadLine is structured across frontend and backend
- How SpreadLine ingests, processes, and visualizes data
- What contracts and flows SpreadLine requires

---

## Scope

Source of truth:

Frontend: app/frontend3  
Backend: app/api/nodeFetchSpreadLine4  

There is an additional external backend that will replace the current CSV data source used by SpreadLine. You must:

- NOT design or implement that backend
- ONLY define the API contract for it (request, response, error formats, semantics)
- Explain how the existing SpreadLine backend should parse and ingest its responses

We control the external API contract.

There is an existing design document at:
- app/frontend2/page.tsx
- https://reimagined-spoon-jj45xv6j7jjpcj6w6-3000.app.github.dev/frontend2

You should extend and incorporate that design.

---

## Objectives

Generate a **formal Technical Design Document** covering:

1. Overview  
2. Architecture  
3. Components  
   - 3.1 Frontend  
   - 3.2 Backend  
   - 3.3 External Services  
4. API Design  
5. Data Models  
6. Core Flows  
7. Error Handling & Edge Cases  
8. Non-Functional Requirements  
9. Dependencies  
10. Assumptions & Open Questions  

For each section:
- Reference concrete files, modules, classes, or functions
- Be explicit and precise
- Use bullet points where helpful

---

## Visualizations & Interactivity

Include:
- Mermaid diagrams for architecture and sequences.  Make sure that visualizations are visible and test it.
- A table of contents with anchor links
- Cross-references between sections (e.g., “see §4.2”)

Be creative, but keep everything technically rigorous and accurate.

---

## Output Format

Use this exact structure:

# Technical Design Document — SpreadLine

## Table of Contents
## 1. Overview
## 2. Architecture
## 3. Components
### 3.1 Frontend
### 3.2 Backend
### 3.3 External Services
## 4. API Design
## 5. Data Models
## 6. Core Flows
## 7. Error Handling & Edge Cases
## 8. Non-Functional Requirements
## 9. Dependencies
## 10. Assumptions & Open Questions

Ultrathink it and I want you to create this documentation at app/spreadline-design1/page.tsx



























-----------------------------------------------------
> it's time for v4 at app/spreadline-design4 I notice that you used the screenshot from screenshot folder.  in there i also included error screenshot and you used that.  so i deleted all 
error screenshot and put only the actual screenshot now.  can you use this to improve the visualization? 
- The numbering in Anatomy of SpreadLine is not in correct location 
- explain the block expansion purpose. it's currently showing author nodes and it seems the higher the citations the more centered it is.  double check this.  once you understand then 
explain what that is and the purpose and how it helps the user to understand
- you can remove Non-Functional Requirements

Ultrathink it and create the next version