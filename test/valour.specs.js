import {expect} from 'chai';
import valour from '../src/valour';
import ValidationUnit from "../src/ValidationUnit";

describe('validation', () => {
  afterEach(() => {
    valour.forms = {};
    valour.callbacks = {};
  });

  describe('rule', () => {
    it('returns a ValidationUnit', () => {
      expect(valour.rule.isEmail()).not.to.be.null;
    });
  });

  describe('onUpdated', () => {
    it('adds a callback to be called when a form is updated', () => {
      let validatedFunc = () => {
        let validated = 'we did it!';
        return validated;
      };
      valour.onUpdated('newForm', validatedFunc);
      expect(valour.callbacks['newForm']).to.contain(validatedFunc);
    });

    it('does not add a callback when the given callback is falsey', () => {
      valour.onUpdated('newForm', null);
      expect(valour.callbacks['newForm']).to.be.falsey;
    });
  });

  describe('register', () => {
    let emailValidation,
      phoneValidation,
      formResult;

    beforeEach(() => {
      emailValidation = valour.rule.isEmail().isRequired();
      phoneValidation = valour.rule.isMobilePhone();
      valour.register('newForm', {
        email: emailValidation,
        phone: phoneValidation
      }, (results) => {
        return results;
      });

      formResult = valour.getForm('newForm');
    });
    
    it('registers a form', () => {
      expect(formResult).to.deep.equal({
        email: emailValidation,
        phone: phoneValidation
      });

      expect(formResult.email).to.deep.equal(emailValidation);
      expect(formResult.phone).to.deep.equal(phoneValidation);
    });

    it('adds a callback if given', () => {
      expect(valour.callbacks['newForm'].length).to.equal(1);
    });
  });

  describe('update', () => {
    let emailValidation,
      phoneValidation,
      postEmailValidation,
      formResult;

    beforeEach(() => {
      emailValidation = valour.rule.isEmail().isRequired();
      phoneValidation = valour.rule.isMobilePhone();
      postEmailValidation = new ValidationUnit(emailValidation).matches(/\./);
      valour.register('newForm', {
        email: emailValidation,
        phone: phoneValidation
      }, (results) => {
        return results;
      });

      valour.update('newForm', {
        email: valour.rule.matches(/\./)
      }, (res) => {
        return res && true;
      });

      formResult = valour.getForm('newForm');
    });
    
    it('registers a form', () => {
      expect(formResult).to.deep.equal({
        email: postEmailValidation,
        phone: phoneValidation
      });

      expect(formResult.email).to.deep.equal(postEmailValidation);
    });

    it('adds a callback if given', () => {
      expect(valour.callbacks['newForm'].length).to.equal(2);
    });
  });

  describe('registering callbacks', () => {
    let emailValidation,
      phoneValidation,
      requiredValidation,
      register = (callback) => {
        valour.register('newForm', {
          email: emailValidation,
          phone: phoneValidation,
          required: requiredValidation
        }, callback);
      };

    beforeEach(() => {
      emailValidation = valour.rule.isEmail().isRequired();
      phoneValidation = valour.rule.isMobilePhone();
      requiredValidation = valour.rule.isRequired();
    });

    describe('runValidation', () => {
      it('updates with the current validation result. Unset fields are not checked.', (done) => {
        register((result) => {
          expect(result.email.valid).to.be.false;
          expect(result.phone.valid).to.be.false;
          expect(result.required.valid).to.equal(undefined);
          done();
        });

        valour.runValidation('newForm', {
          email: 'notanemail',
          phone: 'notanumber'
        });
      });
    });

    describe('forceValidation', () => {
      it('updates with the current validation result. Unset fields are not checked.', (done) => {
        register((result) => {
          expect(result.email.valid).to.be.false;
          expect(result.phone.valid).to.be.false;
          expect(result.required.valid).to.be.false;
          done();
        });

        valour.forceValidation('newForm', {
          email: 'notanemail',
          phone: 'notanumber'
        });
      });
    });
  });

  describe('isValid', () => {
    let register = (callback) => {
      valour.register('newForm', {
        email: valour.rule.isEmail(),
        phone: valour.rule.isMobilePhone()
      }, callback);
    };

    it('returns true when all fields are valid', (done) => {
      register(() => {
        expect(valour.isValid('newForm')).to.be.true;
        done();
      });

      valour.runValidation('newForm', {
        email: 'anemail@mail.com',
        phone: '5544554554'
      });
    });

    it('returns false when any fields are invalid', (done) => {
      register(() => {
        expect(valour.isValid('newForm')).to.be.false;
        done();
      });

      valour.runValidation('newForm', {
        email: 'notanemail',
        phone: '5544554554'
      });
    });
  });
});
