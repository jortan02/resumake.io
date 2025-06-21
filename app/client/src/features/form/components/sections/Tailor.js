/**
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { formValueSelector, arrayMove } from 'redux-form'
import Section from './Section'
import LabeledInput, { Input, Label } from '../fragments/LabeledInput'
import { Button, Divider } from '../../../../common/components'
import type { FormValues } from '../../types'
import type { State } from '../../../../app/types'
import styled from 'styled-components'
import LabeledTextArea from '../fragments/LabeledTextArea'
import SortableResumeSections from '../fragments/SortableResumeSections'

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`

const ButtonRow = styled.div`
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: 15px;
  ${props => props.hidden && 'opacity: 0;'} transition: none;
`

const MiniInput = Input.extend`
  width: 65%;

  @media screen and (max-width: 850px) {
    width: 65%;
  }
`

type Props = {
  basics: $PropertyType<FormValues, 'basics'>,
  work: $PropertyType<FormValues, 'work'>,
  education: $PropertyType<FormValues, 'education'>,
  skills: $PropertyType<FormValues, 'skills'>,
  projects: $PropertyType<FormValues, 'projects'>,
  awards: $PropertyType<FormValues, 'awards'>,
  selectedTemplate: $PropertyType<FormValues, 'selectedTemplate'>,
  tailorDescription: ?string,
  sections: Array<string>,
  dispatch: Function
}

function Tailor({
  basics,
  work,
  education,
  skills,
  projects,
  awards,
  selectedTemplate,
  tailorDescription,
  sections,
  dispatch
}: Props) {
  const onSortEnd = (sectionType, oldIndex, newIndex) => {
    // Use Redux Form's arrayMove to reorder items within the specific section
    dispatch(arrayMove('resume', sectionType, oldIndex, newIndex))
  }

  return (
    <Section heading="Tailor Your Resume">
      <LabeledTextArea label="Job Description" name="tailor.description" placeholder="Enter the job description" />
      <Button onClick={() => {}} isDisabled={!tailorDescription}>Tailor</Button>
      <SortableResumeSections
        sections={sections}
        work={work}
        education={education}
        skills={skills}
        projects={projects}
        awards={awards}
        onSortEnd={onSortEnd}
      />
    </Section>
  )
}

const selector = formValueSelector('resume')

function mapState(state: State) {
  return {
    basics: state.form.resume.values.basics,
    work: state.form.resume.values.work,
    education: state.form.resume.values.education,
    skills: state.form.resume.values.skills,
    projects: state.form.resume.values.projects,
    awards: state.form.resume.values.awards,
    selectedTemplate: state.form.resume.values.selectedTemplate,
    tailorDescription: selector(state, 'tailor.description'),
    sections: state.progress.sections
  }
}

export default connect(mapState)(Tailor)
