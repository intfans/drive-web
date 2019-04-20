import React from 'react';
import { Container, Button, Col } from 'react-bootstrap';
import NavigationBar from './navigationBar/NavigationBar';
import './Security.css';
import { Form } from 'react-bootstrap';
import { encryptText, decryptTextWithKey, decryptText, passToHash } from '../utils';
import ggl from '../assets/google-authenticator.svg';
import appstore from '../assets/app-store.svg';
import gglplay from '../assets/google-play.svg';
import history from '../history';

class Security extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentStep: 1,
            stepView: this.boxLoading(),
            lastClickedButton: undefined,
            bidi: null,
            code: null,
            showButtons: false,
            checkKey: '',
            checkCode: '',
            deactivationPassword: '',
            deactivationCode: '',
            passwordSalt: ''
        }

        // Functions to be used inside sub-views
        this.handleChange = this.handleChange.bind(this);
        this.store2FA = this.store2FA.bind(this);
        this.handleDeactivation = this.handleDeactivation.bind(this);
    }

    userHas2FAStored() {
        const headers = this.setHeaders();
        return new Promise((resolve, reject) => {
            fetch('/api/login', {
                method: 'POST',
                headers,
                body: JSON.stringify({ email: JSON.parse(localStorage.xUser).email })
            }).then(res => res.json()).then(res => {
                this.setState({ passwordSalt: res.sKey });
                resolve(typeof res.tfa == 'boolean' ? res.tfa : false);
            }).catch(err => {
                reject(err);
            });
        });
    }

    pickStep = (buttonNumber, obj) => {
        // Unable to go two steps forward
        if (this.state.currentStep - buttonNumber < -1) {
            return;
        }

        let newBox = (() => {
            switch (buttonNumber) {
                case 1: return this.boxStep1()
                case 2: return this.boxStep2()
                case 3: return this.boxStep3()
                case 4: return this.boxStep4()
            }
        })();

        this.setState({ currentStep: buttonNumber, stepView: newBox });
        obj.currentTarget.className = 'on';

        if (this.state.lastClickedButton) {
            this.state.lastClickedButton.className = '';
        } else {
            let buttons = document.getElementById('buttons')
            buttons.firstChild.className = '';
        }
        this.setState({ lastClickedButton: obj.currentTarget });
    }

    setHeaders = () => {
        let headers = {
            Authorization: `Bearer ${localStorage.getItem("xToken")}`,
            "content-type": "application/json; charset=utf-8"
        };
        return headers;
    }

    generateNew2FA() {
        const headers = this.setHeaders();
        return new Promise((resolve, reject) => {
            fetch('/api/tfa', {
                method: 'GET',
                headers
            }).then(res => {
                return { res, data: res.json() };
            }).then(res => {
                if (res.res.status != 200) {
                    reject(res.data);
                } else {
                    resolve(res.data);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    componentDidMount() {
        if (!this.props.isAuthenticated) {
            history.push('/login');
        } else {
            this.userHas2FAStored()
                .then(hasCode => {
                    if (!hasCode) {
                        // We need to create a new 2FA code to show
                        this.generateNew2FA().then(bidi => {
                            this.setState({
                                showButtons: !hasCode,
                                stepView: this.boxStep1(),
                                bidi: bidi.qr,
                                code: bidi.code
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
                        this.setState({
                            stepView: this.deactivation2FA()
                        });
                    }
                }).catch(err => {
                    alert('Error. Please, try again in a few seconds.');
                });
        }
    }

    render() {
        return <div className="Security">
            <NavigationBar navbarItems={<h5>Settings</h5>} showSettingsButton={true} />
            <Container className="security-box">
                <div className="security-title">Two Factor Authentication{this.state.tfa}</div>
                <div className="security-description">Two Factor Authentication provides an extra layer of security for your X Cloud account by requiring a second step of verification when you sign in. In addition to your password, you’ll also need a code generated by the Google Authenticator app on your phone. Follow the steps below to enable 2FA on your account.</div>
                <div className="security-button-container" id="buttons" style={{ display: this.state.showButtons ? 'block' : 'none' }}>
                    <button onClick={this.pickStep.bind(this, 1)} className="on"><span className="number">1</span><span className="text">Download App</span></button>
                    <button onClick={this.pickStep.bind(this, 2)}><span className="number">2</span><span className="text">Scan QR Code</span></button>
                    <button onClick={this.pickStep.bind(this, 3)}><span className="number">3</span><span className="text">Backup Key</span></button>
                    <button onClick={this.pickStep.bind(this, 4)}><span className="number">4</span><span className="text">Enable</span></button>
                </div>
                <div className="security-content">
                    {this.state.stepView}
                </div>
            </Container>
        </div >;
    }

    // Sub-views
    boxLoading() {
        return <div>Loading...</div>;
    }

    boxStep1() {
        return <div className="box-step-1">
            <div>Download the Google Authenticator app on your device.</div>
            <div>
                <img src={ggl} height={48} className="google-authenticator-logo" />
                <a href="https://itunes.apple.com/es/app/google-authenticator/id388497605" target="_blank"><img src={appstore} height={48} className="app-store" /></a>
                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank"><img src={gglplay} height={48} /></a>
            </div>
        </div>;
    }

    boxStep2() {
        return <div className="box-step-2">
            <div>Use the google Authentication App to scan the QR Code below</div>
            <div className="bidi-container">
                <img src={this.state.bidi} />
                <div className="code-container">
                    <div className="text-code-container">{this.state.code}</div>
                    <div className="desc-code-container">If you are unable to scan the QR code<br />enter this code into the app.</div>
                </div>
            </div>
        </div>;
    }

    boxStep3() {
        return <div className="box-step-3">
            <div>Your backup key is below. You will need this incase you lose your device.<br />Keep an offline backup of your key. Keep it safe and secure.</div>
            <div className="backup-key">{this.state.code}</div>
        </div>;
    }

    handleChange(event) {
        this.setState({
            [event.target.id]: event.target.value,
        });
    }

    boxStep4() {
        return <div className="box-step-4">
            <Form onSubmit={this.store2FA}>
                <Form.Row>
                    <Form.Group as={Col} controlId="checkKey">
                        <Form.Control xs={6} placeholder="Backup Key" onChange={this.handleChange} />
                    </Form.Group>
                    <Form.Group as={Col} controlId="checkCode">
                        <Form.Control xs={6} placeholder="2FA Code" onChange={this.handleChange} />
                    </Form.Group>
                </Form.Row>
                <Button className="btn btn-block" type="submit">Enable Two Factor Authentication</Button>
            </Form>
        </div>;
    }

    store2FA(e) {
        e.preventDefault();
        if (this.state.checkKey != this.state.code) {
            alert('You must insert your backup key in order to validate the 2FA configuration');
            return;
        }
        const headers = this.setHeaders();

        fetch('/api/tfa', {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                key: this.state.code,
                code: this.state.checkCode
            })
        }).then(res => {
            if (res.status == 200) {
                alert('Your 2-Factor Authentication has been activated!');
                this.setState({ showButtons: false });
                this.componentDidMount();
            } else {
                return res.json().then(error => {
                    throw error;
                }).catch(err => {
                    // Propagate the exception to the parent promise
                    return Promise.reject(err);
                });
            }
        }).catch(err => {
            // All exceptions will be catched here
            if (err.error) {
                alert(err.error);
            } else {
                alert('An error ocurred while trying to store your 2FA code. Try again later.');
            }
        });
    }

    handleDeactivation(e) {
        e.preventDefault();

        const salt = decryptText(this.state.passwordSalt);
        const hashObj = passToHash({ password: this.state.deactivationPassword, salt });
        const encPass = encryptText(hashObj.hash);

        const headers = this.setHeaders();

        fetch('/api/tfa', {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                pass: encPass,
                code: this.state.deactivationCode
            })
        }).then(async res => {
            return { res, data: await res.json() }
        }).then(res => {
            if (res.res.status != 200) {
                throw res.data;
            } else {
                alert('Your 2-Factor Authentication has been disabled.');
                this.componentDidMount();
            }
        }).catch(err => {
            if (err.error) {
                alert(err.error);
            } else {
                alert('Internal server error. Try again later.');
            }
        });
    }


    deactivation2FA() {
        return <div className="security-deactivation">
            <div className="disable-description">Disable Google Authentication below</div>
            <Form onSubmit={this.handleDeactivation}>
                <Form.Row>
                    <Form.Group as={Col} controlId="deactivationPassword">
                        <Form.Control xs={6} placeholder="Password" type="password" onChange={this.handleChange} />
                    </Form.Group>
                    <Form.Group as={Col} controlId="deactivationCode">
                        <Form.Control xs={6} placeholder="2FA Code" onChange={this.handleChange} />
                    </Form.Group>
                </Form.Row>
                <Button className="btn btn-block" type="submit">Disable Two Factor Authentication</Button>
            </Form>
        </div>;
    }
}

export default Security;