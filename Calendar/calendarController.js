
/**
 * This is an AngularJS component which powers the front end for a calendar app.
 * 
 * I wrote this only a couple months into my internship with SquareHook and 
 * fresh out of college. It can be found running live at 
 * 
 * http://www.thegallivancenter.com/calendar
 */
calendar.directive('calendarElement', ['calService', function( calService ) {
    
    return {
      restrict: 'E',
      templateUrl: '/calendartemplate',
      scope: true,
      controller: function( calService, $scope ) {
        var self = $scope,
            tempDate, 
            tempFormat;
        
        /*** initialize variables***/
        self.httpService = window.location.href.split(':')[0];
        self.eventData = {};
        self.modalEvents = [];
        self.modalDateString = "";
        self.modalEventId = "";
        self.eventColors = [];
        self.nextFiveDays = [];
        self.allDatesInRange = [];
        self.colorFilterList = {};
        self.modalDate = moment();
        self.currentViewFocusDate = moment();
        self.viewTypes = { Month: 'Month', FiveDay:'Five Day' };
        self.viewType = self.viewTypes.Month;
        self.viewTypeButtonText = "Switch to " + self.viewTypes.FiveDay + " View";
        self.monthViewDates = [ new Array(7),new Array(7),new Array(7),new Array(7),new Array(7),new Array(7) ];
        self.toggleFilterCaptions = [ 'Filter All', 'Show All' ];
        self.toggleFilterCaption = self.toggleFilterCaptions[0];
        self.days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
    
        
        /*** Controller Functions ***/
        
        self.updateMonthDateRange = function( date, days ) {
          var i, 
              j, 
              tempDate,
              daysPrior,
              firstDayInMonth,
              monthViewStartDate;
          
          //input validation
          days = Math.max( days, 42 );
          self.rangeStart = moment( date );
          firstDayInMonth = moment( date ).date( 1 );
         
          //# of days prior to month start in current week
          daysPrior = 0 - firstDayInMonth.day();
          
          //
          monthViewStartDate = moment( firstDayInMonth ).add( daysPrior, 'days' );
          
          if ( self.rangeStart.isAfter( monthViewStartDate ) ) {
            self.rangeStart = moment( monthViewStartDate );
          }
          //rangeEnd will be the last day in our DB query
          self.rangeEnd = moment( monthViewStartDate ).add( days, 'days' );
          
          //Make a moment for each day in our month view
          for (i = 0; i < 6 ; ++i){
            for (j = 0; j < 7; ++j) {
              tempDate = moment( monthViewStartDate ).add( ( i * 7 ) + j , 'days' );
              self.monthViewDates[i][j] = tempDate;
            }
          }
          
          self.selectedMonth = self.monthViewDates[2][0].format( 'MMMM, YYYY' );
        };
        
        //INIT on our first month view
        self.updateMonthDateRange( moment( self.currentViewFocusDate ) , 42 );
        
        //Five Day View Hanlder
        self.computeFiveDays = function( date ){
          var temp;
          self.nextFiveDays = [];
          
          for( i = 0; i < 5; ++i ){
            temp = moment( date ).add( i, 'days' );
            temp.fiveDayFormat = temp.format( 'dddd, M/D' );
            self.nextFiveDays.push( temp );
          }
          
          self.selectedMonth = 'Five Days From ' +
            self.nextFiveDays[0].format( 'M/D' ) +
            ' to ' +
            self.nextFiveDays[4].format( 'M/D' );
        };
        
        //Callback to change data in the view when new data comes in from the API
        self.renderMonthData = function( response ) {
          var data, 
              date, 
              tempTime, 
              tempDuration, 
              hms, 
              colors, 
              temp, 
              colorAverage, 
              i,
              j,
              max,
              min,
              tempNum;
          
          data = response.data.data || response.data.thedata;
              
          //create empty array for each event date
          for ( i = 0; i < data.length; ++i ) {
            data[i].calendarKey = moment( data[i].EventCalendarDateSet[0] ).format( 'M/D/YY' );
            self.eventData[ data[i].calendarKey ] = [];
          }
          
          //new data for all events
          for ( i = 0; i < data.length; ++i ) {
            //Add formatted data to each event
            
            //IMPORTANT: remove the Z from the ISO string, so times are displayed AS SAVED instead of localized
            data[i].EventCalendarDateSet[0] = data[i].EventCalendarDateSet[0].split('Z')[0];
            
            date = data[i].EventCalendarDateSet[0];
            data[i].start_time = moment( date ).format( "h:mm a" );
            data[i].end_time = moment( date ).add( data[i].EventCalendarDuration, 'ms' );
            data[i].duration = moment.duration( data[i].EventCalendarDuration );
      
            //data[i].duration = self.convertMilisecondsToTime( data[i].EventCalendarDuration );
            
            //compute background color
            colors = colors || [];
            
            temp = data[i].EventCalendarColor;
            if (temp.length > 0 ) {
              if ( temp.charAt(0) === '#' ) {
                temp = temp.substring(1);
              } else {
                data[i].EventCalendarColor = '#' + data[i].EventCalendarColor;
              }
            } else {
              //DEFAULT COLOR
              temp = '03C5F5';
              data[i].EventCalendarColor = '#03C5F5';
            }
            
            if ( ! _.contains(self.eventColors, data[i].EventCalendarColor) ){
              self.eventColors.push( data[i].EventCalendarColor );
            }
            
            colors.push( parseInt( "0x" + temp.substring(0,2) ) );
            colors.push( parseInt( "0x" + temp.substring(2,4) ) );
            colors.push( parseInt( "0x" + temp.substring(4) ) );
            
            //match with white or black font based on average
            colorAverage = ( colors[0] + colors[1] + colors[2] )/3;
            
            if ( _.max( colors ) > 220 && _.min( colors ) < 40 ) {
              data[i].fontColor = '#000000';
            } else {
              data[i].fontColor = colorAverage < 160 ? '#ffffff' : '#000000'; 
            }
            
            self.eventData[ data[i].calendarKey ].push( data[i] );
          }
          
          
          for (i = 0; i < self.eventColors.length; ++i ) {
            //initialize new color filters
            if ( typeof self.colorFilterList[ self.eventColors[i] ] === 'undefined' ) {
              self.colorFilterList[ self.eventColors[i] ] = true;
            }
          }
        };
        
        
        //INIT data for our first view
        calService.fetchDataDuring(
          self.monthViewDates[0][0].format(),
          self.monthViewDates[5][6].format() )
        .then( function( response ) {
          self.renderMonthData( response ) 
        });
        
        //Toggle Month View / Five Day View
        self.viewTypeChange = function() {
          //invert the view type
          self.viewTypeButtonText = "Switch to " + self.viewType + " View";
          self.selectedMonth = self.monthViewDates[2][0].format( 'MMMM, YYYY' );
          
          if ( self.viewType === self.viewTypes.Month ) {
            self.viewType = self.viewTypes.FiveDay;
            self.computeFiveDays( self.currentViewFocusDate );
            //pull more data if necessary
            if ( ( self.rangeEnd.dayOfYear() - self.currentViewFocusDate.dayOfYear() ) < 5 ) {
              self.updateMonthDateRange( self.currentViewFocusDate, 48 );
            }
            
          } else {
            self.viewType = self.viewTypes.Month;
          }
          
        }
        
        //An event in the view was clicked
        self.loadModalInfo = function( requestDate, id ) {
          self.modalDate = moment( requestDate );
          self.modalEventId = id;
          //$scope.singleEventId = id;
          self.currentViewFocusDate = moment( self.modalDate );
          self.modalDateString = self.modalDate.format( 'dddd, MMMM Do YYYY' );
          self.modalEvents = self.eventData[ self.modalDate.format( 'M/D/YY' ) ];
        };
        
        //Modal prev/next navigation handler
        self.modalChangeDay = function( direction ) {
          var days = direction === 'prev' ? -1 : 1;  
          
          self.shiftDateRange( days, 1 );
          self.modalEventId = "";
          self.modalDate = moment( self.modalDate ).add( days, 'days' );
          self.currentViewFocusDate = moment( self.modalDate );
          self.modalDateString = self.modalDate.format( 'dddd, MMMM Do YYYY' );
          self.modalEvents = self.eventData[ self.modalDate.format( 'M/D/YY' ) ];
        };
        
        // Prev btn handler in the Month or 5 day view
        self.previousDateRange = function() {
          var shift;
          
          if( self.viewType === self.viewTypes.FiveDay ) {
            self.shiftDateRange( - 5, 5 );
            self.computeFiveDays( self.currentViewFocusDate );
          } 
          
          else {
            if ( self.currentViewFocusDate.date() != 1 ) {
              self.currentViewFocusDate.date(1);
            }
            shift = moment( self.currentViewFocusDate ).subtract( 1, 'months' ).daysInMonth();
            self.shiftDateRange( - shift, 42 );
          }
        };
        
        // Next btn handler in the Month or 5 day view
        self.nextDateRange = function(){
          var shift;
          
          if(self.viewType === self.viewTypes.FiveDay) {
            self.shiftDateRange( 5, 5 );   
            self.computeFiveDays( self.currentViewFocusDate );
          } 
          
          else {
            if ( self.currentViewFocusDate.date() != 1 ){
              self.currentViewFocusDate.date(1);
            }
            shift = self.currentViewFocusDate.daysInMonth();
            self.shiftDateRange( shift, 42 );
          }
        };
        
        //Change the range shown in the current view. Get new data if necessary.
        self.shiftDateRange = function(focusShift, rangeLength) {
          var tempMomentStart, 
              tempMomentEnd;
          
          self.currentViewFocusDate.add(focusShift, 'days');
          tempMomentStart = moment( self.currentViewFocusDate ).subtract( rangeLength, 'days');
          tempMomentEnd = moment( self.currentViewFocusDate ).add( rangeLength, 'days');
          
          //Only get new data in certain cases
          if (
            ( Math.abs( focusShift ) >= 28 ) || 
            ( focusShift < 0 && self.rangeStart.isAfter( tempMomentStart ) ) ||
            ( focusShift > 0 && self.rangeEnd.isBefore( tempMomentEnd ) ) 
          ){
            self.getMonthData();
          }
        };
        
        //helper function to grab data for the current month view
        self.getMonthData = function ( ) {
          self.updateMonthDateRange( self.currentViewFocusDate, 48 );
          
          calService.fetchDataDuring(
            self.monthViewDates[0][0].format(),
            self.monthViewDates[5][6].format() )
          .then( function( response ) {
            self.renderMonthData( response ) 
          });
        };
        
        self.filterColor = function( color ) {
          self.colorFilterList[ color ] = !self.colorFilterList[ color ];
        };
        
        self.toggleAllColorFilters = function() {
          if ( self.toggleFilterCaption === self.toggleFilterCaptions[0] ) {
            for( var i = 0; i < self.eventColors.length; ++i ) {
              self.colorFilterList[ self.eventColors[i] ] = false;
            }
            
            self.toggleFilterCaption = self.toggleFilterCaptions[1];
            
          } else {
            for( var i = 0; i < self.eventColors.length; ++i ) {
              self.colorFilterList[ self.eventColors[i] ] = true;
            }
            
            self.toggleFilterCaption = self.toggleFilterCaptions[0];
          }
        };
      }
    };
  }]);