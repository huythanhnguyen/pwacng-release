import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import GET_REVIEW_RATING_METADATA from "./reviewRatingMetadata.gql";
import CREATE_REVIEW_MUTATION from './createReviewMutation.gql';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import Button from "@magento/venia-ui/lib/components/Button";
import {Form} from "informed";
import Field from "@magento/venia-ui/lib/components/Field";
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import TextInput from "../TextInput/textInput";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import {FormattedMessage, useIntl} from "react-intl";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "@magenest/theme/BaseComponents/Reviews/reviewForm.module.scss";
import { useToasts } from '@magento/peregrine';
import {useUserContext} from "@magento/peregrine/lib/context/user";

const ReviewForm = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { sku } = props;

    const [{ isSignedIn, currentUser }] = useUserContext();

    const { firstname } = currentUser;

    const nickname = firstname || 'nickname'
    const [summary, setSummary] = useState('');
    const [text, setText] = useState('');
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    const { data, error, loading } = useQuery(GET_REVIEW_RATING_METADATA);
    const ratingMetadata = data?.productReviewRatingsMetadata?.items || [];

    const [createReview, {useLazyQuery:loadingCreateReview, error:errorCreateReview}] = useMutation(CREATE_REVIEW_MUTATION);

    const defaultRatings = {};
    ratingMetadata.forEach((item) => {
        defaultRatings[item.id] = item.values[item.values.length - 1].value_id;
    });
    const [selectedRatings, setSelectedRatings] = useState(defaultRatings);

    useEffect(() => {
        if (!(selectedRatings && Object.keys(selectedRatings).length > 0)) {
            setSelectedRatings(defaultRatings)
        }
    }, [defaultRatings, setSelectedRatings]);

    const handleRatingChange = (ratingId, valueId) => {
        setSelectedRatings(prevRatings => ({
            ...prevRatings,
            [ratingId]: valueId
        }));
    };

    const handleSubmit = async (formApi) => {
        const ratings = Object.keys(selectedRatings).map(ratingId => ({
            id: ratingId,
            value_id: selectedRatings[ratingId]
        }));

        try {
            await createReview({
                variables: {
                    sku,
                    nickname,
                    summary,
                    text,
                    ratings
                }
            });
            addToast({
                type: 'success',
                message: formatMessage({
                    id: 'reviewForm.submitMessage',
                    defaultMessage: 'Review submitted successfully.'
                }),
                timeout: 5000
            });

            // Reset các trường sau khi gửi
            formApi.reset();
            setSummary('');
            setText('');
            setSelectedRatings(defaultRatings);
        } catch (error) {
            console.error('Error submitting review:', error);
            addToast({
                type: 'error',
                message: formatMessage({
                    id: 'reviewForm.submitError',
                    defaultMessage: 'Error submitting review.'
                }),
                timeout: 5000
            });
        }
    };

    if (!isSignedIn) return null;
    if (loading) return (<LoadingIndicator />);
    if (error) return <p>Error: {error.message}</p>;

    return (
        <>
            <Form
                className={classes.root}
                getApi={formApi => (window.formApi = formApi)}
                onSubmit={() => handleSubmit(window.formApi)}
                data-cy="createReview-form"
            >
                <div className={classes.formTitle}>
                    <FormattedMessage
                        id={'reviewForm.title'}
                        defaultMessage={'Write a review'}
                    />
                </div>
                <div className={classes.reviewRatings}>
                    {ratingMetadata.map((item, index) => (
                        <div className={classes.reviewRating} key={item.id}>
                            <span className={classes.ratingName}>{item.name}</span>
                            <div className={classes.reviewRatingInner}>
                            {item.values.map((star, startIndex) => (
                                <label className={'inputStart' + startIndex} key={star.value_id}>
                                    <input
                                        name={item.id}
                                        type="radio"
                                        value={star.value_id}
                                        checked={(selectedRatings[item.id] === star.value_id) || (!selectedRatings[item.id] && startIndex === item.values.length - 1)}
                                        onChange={() => handleRatingChange(item.id, star.value_id)}
                                    />
                                    <span>{star.value}</span>
                                </label>
                            ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={classes.reviewFields}>
                    <Field
                        id="summary"
                        label={formatMessage({
                            id: 'reviewForm.reviewSummary',
                            defaultMessage: 'Review summary'
                        })}
                        optional={true}
                    >
                        <TextInput
                            id="summary"
                            data-cy="ReviewForm-summary"
                            field="summary"
                            validate={isRequired}
                            placeholder={formatMessage({
                                id: 'reviewForm.reviewSummaryEnter',
                                defaultMessage: `Enter review summary`
                            })}
                            aria-label={formatMessage({
                                id: 'reviewForm.reviewSummaryRequired',
                                defaultMessage: 'Review summary Required'
                            })}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </Field>
                    <Field
                        id="detail"
                        label={formatMessage({
                            id: 'reviewForm.reviewDetail',
                            defaultMessage: 'Review detail'
                        })}
                        optional={true}
                    >
                        <TextArea
                            autoComplete="detail"
                            field="detail"
                            id="detail"
                            maxLength="300"
                            validate={isRequired}
                            placeholder={formatMessage({
                                id: 'reviewForm.reviewDetail',
                                defaultMessage: `Review detail`
                            })}
                            aria-label={formatMessage({
                                id: 'reviewForm.reviewDetailRequired',
                                defaultMessage: 'Review detail Required'
                            })}
                            data-cy="comment"
                            onChange={(e) => setText(e.target.value)}
                        />
                        <p className={classes.inputLimit}>
                            <FormattedMessage
                                id={'reviewForm.reviewDetailLimit'}
                                defaultMessage={'300 character limit'}
                            />
                        </p>
                    </Field>
                </div>
                <div className={classes.reviewActions}>
                    <Button
                        priority="high"
                        type="submit"
                        data-cy="CreateReviewButton-root_highPriority"
                    >
                        <FormattedMessage
                            id={'reviewForm.submitReview'}
                            defaultMessage={'Submit Review'}
                        />
                    </Button>
                </div>
            </Form>
            {loadingCreateReview && <LoadingIndicator />}
            {errorCreateReview && <p>Error creating review: {errorCreateReview.message}</p>}
        </>
    );
};

export default ReviewForm;
