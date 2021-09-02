const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthentcationPayloadScema,
} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationsValidator = {
  // Validate POST authentication payload
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = PostAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  // Validate PUT authentication payload
  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  // validate DELETE authentication payload
  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = DeleteAuthentcationPayloadScema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;


