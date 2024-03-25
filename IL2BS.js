// ----------------------------------------------------------------------------------	
//     IL2BS - Convert Ilearn Quiz to BrightSpace format
//  
//  V1.2b 06/17/2023  Original .js file, support for x points, minor fixes 
//  V1.2c 06/18/2023  fix for MC questions that span multiple lines,   
//  V1.2d 06/27/2023  remove mutiple spaces; fix for option with * and a space
//  V1.3  07/21/2023  now suport mutliple answers separated by a "|"  
//  V1.4  09/17/2023  better support for questions with multiple answers  
//  V1.5  09/27/2023  support for POINTS & Eliminated Randomize 
//                    more version info & set title from JS  
//  V1.6  09/30/2023  now supports Qx.   with no (POINTS)  
//  V1.7  10/03/2023  now checks if MC question has at least one answer!
//  V1.8  11/28/2023  allow one comment before question 
//  V1.9  01/05/2024  error message is more probnounced 
//  V1.10 02/03/2024  display questions with commas  
//  V1.11 03/25/2024  now check MC questions for space between answer and "." 
// ----------------------------------------------------------------------------------	
//   loop through the input lines, for the current question, save the following info
//        qText        -  the text of the question
//        qFeedback    -  feedback from the #FBNOK input 
//        qAnswer      -  the answer to written questions (if any) 
//        qPoints      -  the number of points for the question      	  
//        options      -  array of options for MC or TF questions   
//
//    Note: currently replaces commas with semicolons 
//
//    Note: when we get a new question, process previous question
//          except 1st question, and the last (dummy) question 	  
//  ----------------------------------------------------------------------------------	
	function setversion(){  
	   	
	   	var version  = document.getElementById("version");
	   	document.title    = "IL-to-BS 1.11"
	   						  
		 version.innerHTML =  "    Version 1.11   </b> " + 
						      "<br> <small style='color: black;'> 03/25/2024  Added another warning check.";  
						      
						      
	}	
	
	
	
	
	function convert(){
	 	 
		// -----------------------------------------------------------------------------//  
	   	var inputBox   = document.getElementById("input");
		var input = inputBox.value + "\n 999. (1 point) End of File";    // extra line so we process last question
		var lines = input.split('\n');

		var convertCommas    = document.getElementById("convertCommas").value;   // v1.10
		
		lastQuestion = ""; 		
		
			
      // output is the full output to be displayed in the outputwindow; message is message  
		var outputBox = document.getElementById("output");
		var output    =""; 
		var message   = document.getElementById("message");
		
		var errors	  ="";  // 1.7;
		
			
	  // question is an array of the last question lines, processed when we have a new line       
		var qNumber = -1 ;

	  // comment saved and then printed when we process a new questions  v 1.8 
		var	qComment = NextComment = "" ;
		
		
	  // ----------------------------------------------------------------------------------	
	  //   loop through the input lines, for the current question
	  //    Note: when we get a new question, process previous question
      //          except 1st question, and the last (dummy) question 	  
	  //  ----------------------------------------------------------------------------------	
	  	for(var i = 0;i < lines.length;i++){
			thisline  =  lines[i].trim();
			if (convertCommas == "yes") {thisline = thisline.replace(/,/g, ";");}    // 1.10
			
		 	thisline = thisline.replace( /\s\s+/g, ' ' );   // replace double-spaces 1.2d
			thisline = thisline.replace("#randomize","");   //  get rid of randomize option  1.5 
			if (thisline.substr(0,2) == "* ") {thisline = "*" + thisline.substr(2);}
						      
			if ( thisline == "") continue;                  // ignore blank lines!  
			
			if (thisline.substr(0,2) == "//") {NextComment = thisline.substr(2);} // v1.8
			if (thisline.substr(0,2) == "//") continue;              // v1.8
			
			
			if (thisline.substr(1,1) == " " & thisline.substr(2,1) == ".") {     // v1.11
				errors += "Review question " + (qNumber+1) + ": there may be a space after the MC answer<br>";
			}
			if (thisline.substr(0,1) == "*" && thisline.substr(2,1) == " " & thisline.substr(3,1) == ".") {     // v1.11
				errors += "Review question " + (qNumber+1) + ": there may be a space after the MC answer<br>";
			}  
			
			
			
			
			thislineU = thisline.toUpperCase();

			   
		 // -------- if line starts with "Qxx." treat as a new question and add (1 point)   -------------------
			firstWord = thislineU.split('.')[0]
			
			if (firstWord.charAt(0) == "Q" && firstWord.length < 5) {    // line starts with Qxx. 
			   			   		   
				if ( thislineU.indexOf("POINT)") == -1 && thislineU.indexOf("POINTS)") == -1) { 
					thislineX = firstWord + ". (1 point) " + thisline.substr( firstWord.length + 1);
					thisline = thislineX;
					thislineU = thisline.toUpperCase();   
				}	
			}   
		 

		 
		 // -------- When we have a new question, process previous and  reset -------------------

			newQuest = false;
			if ( thislineU.indexOf("POINT)") > -1 || thislineU.indexOf("POINTS)") > -1) { newQuest = true;}      // 1.6

			if ( newQuest )  { 
				qNumber = qNumber +1; 
				
			
				if ( qNumber == 0 ) {}    // there is no previous question; don't do anything! 
				else { 						
				
						origNumEnd = qText.indexOf("(");                   // save original question number v1.5
						qOrigNum   = qText.substr(0,origNumEnd);
						qOrigNum   = qOrigNum.trim();
						if ( qOrigNum.substr( qOrigNum.length - 1 ) == ".")
							{ qOrigNum = qOrigNum.substr(0, qOrigNum.length - 1)};	
				
		
						start = qText.indexOf(")"); 
						qText = qText.substr(start+1); 
						qText = qText.trim(); 

						if (optionCorrect > 1) { qTypeReal = "MS";}               /* 1.4 */  
						else {qTypeReal = qType;} 	


												
	//					lastQuestion = "Final question number " + qNumber + " was originally number " + qOrigNum; 
						lastQuestionNum = qOrigNum ; 
						
						output += "// ---------------------- " + (qNumber) + " (originally " + qOrigNum +") ---------------------------,,,, \n";
						if (qComment.trim() != "") { output += qComment + "\n"; }   // v1.8
						output += "NewQuestion,   " + qTypeReal  + ",,,\n"; 
						
						if ( qText.includes(",")  & convertCommas == "no" ) {  qText = '"' + qText +'"'; }       // 1.10  
						 
						
						output += "QuestionText,  " + qText + ",,,\n"; 			   
						output += "Points      ,  " + qPoints     + ",,,\n"; 	

 
			
					//	if (qType == "WR") { output += "AnswerKey   , " + qAnswer     + ",,,\n"; }    ORIGINAL CODE B4 MULT ASNWERS 
						if (qType == "SA") {
					
						    qAnswer += "|~ENDWRX~";  
							while (qAnswer != "~ENDWRX~") {
								 endX = qAnswer.indexOf("|");
								thisAnswer = qAnswer.substr(0,endX); 
								if ( thisAnswer.includes(",")  & convertCommas == "no" ) {  thisAnswer = '"' + thisAnswer +'"'; }       // 1.10  
							
								qAnswer = qAnswer.substr(endX+1);
								if (thisAnswer.trim() != "") {output += "Answer     , 100, " + thisAnswer     + ",,\n"; }   // v1.8 							
							}							
							
						}
					
						
						
						if (qType == "TF") {                      // TF: option is the actual outputted text 
						    if ( optionCorrect == 0 ) { errors += "True/False Question " + qNumber + " has no correct answer! <br>"; }   // 1.7
							if ( optionCorrect == 2 ) { errors += "True/False Question " + qNumber + " has TWO correct answer! <br>"; }   // 1.7
							for(var o = 1; o < optionX+1; o++){ 
								output += options[o] + "\n";  
							}
						}
						if (qType == "MC") {  
						
							if ( optionCorrect == 0 ) { errors += "MultiChoice Question " + qNumber + " has no correct answers! <br>"; }   // 1.7
						
							for(var o = 1; o < optionX + 1; o++){
							
								if (optionStat[o] == "C") {optionVal = Math.trunc(100 / optionCorrect);}   /* 1.4 */
								else 					  {optionVal = "  0"; }
								
								if ( options[o].includes(",")  & convertCommas == "no" ) {  options[o] = '"' + options[o] +'"'; }       // 1.10  
								
								
								output += "Option, " + optionVal +" ,  " + options[o] + ",,\n"; 
							}
						}
						if ( qFeedback.includes(",")  & convertCommas == "no" ) {  qFeedback = '"' + qFeedback  +'"'; }       // 1.10  
						output += "Feedback    , " + qFeedback + ",,,\n"; 			   
						
												
				}	
	
			// reset the previous question for next time!
				qText     = qFeedback = qAnswer = qComment = "" ; 
				if (NextComment.trim() != "") {qComment  = "// -------" + NextComment;}

				NextComment = "";    // v1.8
				qType     = "SA";
				var qPoints = thislineU.substr(thislineU.indexOf("(")+1); 
			 	qPoints = qPoints.substr(0, qPoints.indexOf(" ")); 
					
				
				status    = "text";         // text, option, answer, feedback, etc 
				
				options       = [];          
				optionX	      = 0;  
				optionStat    = []; 
				optionCorrect = 0 ;      // how many correct options   
				
			}
			
			
		// -------- This code sets the type of question : supported MF, WR and TF  -------------------
			if      ( thislineU == "999. (1 point) End of File") { 
					   qType = "EOF";} 
			if ( thislineU.substr(0,3) == "*A." || thislineU.substr(0,2) == "A."  ){
				  	  qType = "MC";	status= "option";}
			if ( thislineU == "TRUE" || thislineU == "FALSE"){
					  qType = "TF";	status="option";  points = 0; tfStatus = thislineU;  }	
			if ( thislineU == "*TRUE" || thislineU == "*FALSE"){ 
					  qType = "TF"; status="option";  points = 100; tfStatus= thislineU.substr(1); }	
			
					  
		// -------- Now save the current line    -------------------			  
			if      ( thislineU.substr(0,7) == "#FBNOK:") { 
						qFeedback = thisline.substr(8); }
			else if ( qType  == "SA" & thisline.substr(0,1) =="*") {
						status = "answer"; qAnswer += thisline.substr(1);}
			else if (status == "text")   {
						qText   += " " + thisline;}    
			else if (status == "answer") { 
						qAnswer   += " " + thisline;} 			
						
			else if ( qType  == "TF" ) {          // TF we set the option to the actual outputted text 
			     optionX = optionX + 1; 
				 if (points == 100) {optionCorrect += 1;}     // 1.7  used to just to '1', now counts 
				 options[optionX] = tfStatus + "," + points + ",,,";}
			
			else if (status == "option" & thislineU.substr(1,1) != "." &  thislineU.substr(2,1) != ".")   { 
				 options[optionX] += " " + thisline;
			}	 
			else if (status == "option") { 
				optionX = optionX + 1;	
				if (thisline.substr(0,1) == "*") { 
					optionCorrect++; optionStat[optionX] = "C"; 
					thisline = thisline.substr(1);} 
				else { optionStat[optionX] = " "; }
				options[optionX] = thisline;
			} 		
			else if (status == "optionExtension") { 
				options[optionX] =+ " "+ thisline;
			} 		
			
		}	
	
	  // When all done fill the conversion box, and display a message  
		outputBox.textContent = output; 
					
					
		let d = new Date();
		let t = d.toLocaleTimeString();

		if (errors != "") { 
				error.innerHTML   = "<b> <p style='color:red; text-align: center;'> &#9888; WARNING &#9888;  <br>" +  errors; + "</b>"
				error2.innerHTML  = "<b> <p style='color:red; text-align: center;'> &#9888; WARNING &#9888;  <br>" +  errors; + "</b>"
		}   // v1.7
		
	
		message.innerHTML  = t.substr(0,t.indexOf(" ")) +
			" Converted " + qNumber + " questions. Copy & paste into the file of your choice" +			
			"<br> <small> Note: Final question is number " +  lastQuestionNum + "; original file number is " + qNumber;
						
		
	}

// EOF