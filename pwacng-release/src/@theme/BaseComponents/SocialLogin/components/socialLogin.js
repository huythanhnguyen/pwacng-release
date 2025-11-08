import React, {useCallback, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {
    LoginSocialGoogle,
    LoginSocialFacebook
} from 'reactjs-social-login';
import { Facebook, Google, MMLogo } from '@magenest/theme/static/icons';
import defaultClasses from './socialLogin.module.scss';
import { useStyle } from '@magento/venia-ui/lib/classify';
import useSocialLogin from "../../../Talons/SocialLogin/useSocialLogin";
import Modal from "../../Modal";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "../../../../override/Components/TextInput/textInput";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import {Form} from "informed";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isPhoneNumber} from "../../../../override/Util/formValidators";
import Button from "../../../../override/Components/Button/button";

const REDIRECT_URI = window.location.origin;

const SocialLogin = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const talonProps = useSocialLogin();
    const {
        handleResolve,
        onLogoutSuccess
    } = talonProps;

    return (
        <div className={classes.socialLogin}>
            {/*<button className={classes.mCardButton} type={'button'}>*/}
            {/*    <img src={MMLogo} alt={'Google'}/>*/}
            {/*    <span>*/}
            {/*        <FormattedMessage*/}
            {/*            id={'signIn.loginWithMCardText'}*/}
            {/*            defaultMessage={'Login with '}*/}
            {/*        />*/}
            {/*        <strong>MCARD</strong>*/}
            {/*    </span>*/}
            {/*</button>*/}
            <LoginSocialGoogle
                client_id={'222045128234-12sq1ekidc61s0d2ffafof71eqegg893.apps.googleusercontent.com'}
                redirect_uri={REDIRECT_URI}
                onLogoutSuccess={onLogoutSuccess}
                scope="profile email"
                access_type="offline"
                approval_prompt="auto"
                response_type="code"
                onResolve={({provider, data}) => handleResolve(provider, data)}
                onReject={err => {
                    console.log(err);
                }}
                className={classes.social}
            >
                <button type={'button'}>
                    <img src={Google} alt={'Google'}/>
                    Google
                </button>
            </LoginSocialGoogle>
            <LoginSocialFacebook
                appId={'1031510681791734'}
                fieldsProfile={
                    'id,first_name,last_name,middle_name,name,name_format,picture,short_name,email,gender'
                }
                onLogoutSuccess={onLogoutSuccess}
                scope="public_profile,email"
                redirect_uri={REDIRECT_URI}
                onResolve={({provider, data}) => handleResolve(provider, data)}
                onReject={err => {
                    console.log(err);
                }}
                className={classes.social}
            >
                <button type={'button'}>
                    <img src={Facebook} alt={'Facebook'}/>
                    Facebook
                </button>
            </LoginSocialFacebook>
        </div>
    )
}

export default SocialLogin
