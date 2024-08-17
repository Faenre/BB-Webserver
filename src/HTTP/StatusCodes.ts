export enum Status {
	// Informational:
	PROCESSING = 102, 					// the message was received and is being processed, but this may take time

	// Success indicators:
	OK = 200,									  // default response for a successful call
	CREATED = 201, 						  // a new resource was created, e.g. a server was purchased
	NO_CONTENT = 204, 					// alternative to OK indicating there is no data to return

	// Client errors:
	BAD_INPUT = 400,						// the request was malformed and cannot be interpreted
	PAYMENT_REQUIRED = 402, 		// player does not have enough money for the operation
	NOT_FOUND = 404,						// the endpoint does not exist
	CONFLICT = 409, 						// conflict encountered, e.g. 'a server with that name already exists'
	PRECONDITION_FAILED = 412,  // something is missing, e.g. the player does not have the Formulas API

	// Server errors:
	SERVER_ERROR = 500,				  // an issue happened in the webserver (this script)
	NOT_IMPLEMENTED = 501, 		  // the endpoint is recognized but stubbed (unfinished)
	SERVICE_UNAVAILABLE = 503 	// an issue happened on an external service, e.g. another process is locked up
};

export interface StatusCode {
	status: string;
	code: number;
};

export const StatusCodes: Record<Status, StatusCode> = Object.freeze({
  // Informational:
  [Status.PROCESSING]:          {code: Status.PROCESSING, status: 'Processing'},

  // Success indicators:
  [Status.OK]:                  {code: Status.OK, status: 'Ok'},
  [Status.CREATED]:             {code: Status.CREATED, status: 'Created'},
  [Status.NO_CONTENT]:          {code: Status.NO_CONTENT, status: 'No Content'},

  // Client errors:
  [Status.BAD_INPUT]:           {code: Status.BAD_INPUT, status: 'Bad Input'},
  [Status.PAYMENT_REQUIRED]:    {code: Status.PAYMENT_REQUIRED, status: 'Payment Required'},
  [Status.NOT_FOUND]:           {code: Status.NOT_FOUND, status: 'Resource Not Found'},
  [Status.CONFLICT]:            {code: Status.CONFLICT, status: 'Conflict'},
  [Status.PRECONDITION_FAILED]: {code: Status.PRECONDITION_FAILED, status: 'Precondition Failed'},

  // Server errors:
  [Status.SERVER_ERROR]:        {code: Status.SERVER_ERROR, status: 'Server Error'},
  [Status.NOT_IMPLEMENTED]:     {code: Status.NOT_IMPLEMENTED, status: 'Not Implemented'},
  [Status.SERVICE_UNAVAILABLE]: {code: Status.SERVICE_UNAVAILABLE, status: 'Service Unavailable'},
});
