'use strict';

const fs = require('fs');
const { IamAuthenticator } = require('../../auth');
const LanguageTranslatorV3 = require('../../language-translator/v3');
const authHelper = require('../resources/auth_helper.js');
const describe = authHelper.describe; // this runs describe.skip if there is no auth.js file :)
const TWENTY_SECONDS = 20000;

// todo: figure out why these started all failing with Not Authorized
describe('language_translator_integration', () => {
  jest.setTimeout(TWENTY_SECONDS * 2);

  const options = authHelper.auth.language_translator;
  options.authenticator = new IamAuthenticator({ apikey: options.apikey });
  options.version = '2019-03-27';
  const language_translator = new LanguageTranslatorV3(options);

  it('listModels()', done => {
    language_translator.listModels(null, (err, res) => {
      expect(err).toBeNull();
      expect(res).toBeDefined();
      done();
    });
  });

  it('translate()', done => {
    const params = {
      text: 'this is a test',
      source: 'en',
      target: 'es',
    };
    language_translator.translate(params, (err, res) => {
      expect(err).toBeNull();
      expect(res).toBeDefined();
      done();
    });
  });

  it('listIdentifiableLanguages()', done => {
    language_translator.listIdentifiableLanguages((err, res) => {
      expect(err).toBeNull();
      expect(res).toBeDefined();
      done();
    });
  });

  it('identify()', done => {
    const params = {
      text: 'this is an important test that needs to work',
    };
    language_translator.identify(params, (err, res) => {
      expect(err).toBeNull();
      expect(res).toBeDefined();
      done();
    });
  });

  describe('models', () => {
    let baseModelId;
    let modelId;
    it('should list all the models', done => {
      language_translator.listModels((err, res) => {
        const { result } = res || {};
        expect(result).toBeDefined();
        baseModelId = result.models[0].model_id;
        done();
      });
    });

    it('should create a model', done => {
      language_translator.createModel(
        {
          baseModelId,
          forcedGlossary: fs.createReadStream('./test/resources/glossary.tmx'),
        },
        (err, res) => {
          const { result } = res || {};
          expect(result).toBeDefined();
          modelId = result.model_id;
          done();
        }
      );
    });

    it('should get the details of the model', done => {
      if (!modelId) {
        // We cannot run this test when model creation failed.
        return done();
      }

      language_translator.getModel({ modelId }, (err, res) => {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        done();
      });
    });

    it('should delete the model', done => {
      if (!modelId) {
        // We cannot run this test when model creation failed.
        return done();
      }

      language_translator.deleteModel({ modelId }, (err, res) => {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        done();
      });
    });
  });

  describe('documentTranslation @slow', () => {
    let documentId;
    // The service was down, could not test the test.
    it('should translate document', done => {
      language_translator.translateDocument(
        {
          file: fs.createReadStream('./test/resources/alchemy-text.txt'),
          filename: 'alchemy-text.txt',
          modelId: 'en-es',
        },
        (err, res) => {
          const { result } = res || {};
          expect(result).toBeDefined();
          documentId = result.document_id;
          done();
        }
      );
    });

    it('should list translated documents', done => {
      language_translator.listDocuments((err, res) => {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        done();
      });
    });

    it('should get translated document status', done => {
      if (!documentId) {
        // We cannot run this test when document upload failed.
        return done();
      }

      language_translator.getDocumentStatus({ documentId }, (err, res) => {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        done();
      });
    });

    it('should get translated document', done => {
      if (!documentId) {
        // We cannot run this test when document upload failed.
        return done();
      }

      language_translator.getTranslatedDocument({ documentId }, (err, res) => {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        done();
      });
    });

    it('should delete document', done => {
      if (!documentId) {
        // We cannot run this test when document upload failed.
        return done();
      }

      language_translator.deleteDocument({ documentId }, (err, res) => {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        done();
      });
    });
  });
});